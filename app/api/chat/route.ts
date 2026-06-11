import { NextResponse } from "next/server";
import { callOciGenAi, type ChatMessage } from "@/lib/oci-genai";
import { getAppData } from "@/lib/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatRequest = {
  message?: string;
  model?: string;
  history?: ChatMessage[];
};

function sanitizeHistory(history: unknown): ChatMessage[] {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter((item): item is ChatMessage => {
      if (!item || typeof item !== "object") {
        return false;
      }

      const record = item as Record<string, unknown>;
      return (
        (record.role === "user" || record.role === "assistant") &&
        typeof record.content === "string" &&
        record.content.trim().length > 0
      );
    })
    .slice(-8);
}

function buildOneTeamContext() {
  const data = getAppData();
  const topAccounts = [...data.accounts].sort((a, b) => b.engagementScore - a.engagementScore).slice(0, 12);
  const upcomingMeetings = data.meetings.slice(0, 6);
  const productInterest = data.productInterest.slice(0, 8);
  const transcripts = data.transcripts.slice(0, 4);

  return [
    `Total accounts: ${data.accounts.length}`,
    "",
    "Top accounts by engagement:",
    ...topAccounts.map(
      (account) =>
        `- ${account.name} | ${account.industry} | HQ: ${account.headquarters} | Tier: ${account.tier} | Engagement: ${account.engagementScore} | Open opportunity: ${account.openOpportunities[0]}`
    ),
    "",
    "Upcoming and recent meetings:",
    ...upcomingMeetings.map(
      (meeting) =>
        `- ${meeting.date} | ${meeting.title} | ${meeting.type} | Summary: ${meeting.summary} | Actions: ${meeting.actionItems.join("; ")}`
    ),
    "",
    "Product interest:",
    ...productInterest.map((item) => `- ${item.product}: ${item.value}`),
    "",
    "Recent transcript intelligence:",
    ...transcripts.map(
      (transcript) =>
        `- ${transcript.title} | ${transcript.source} | Summary: ${transcript.extracted.summary} | Topics: ${transcript.extracted.topics.join(", ")}`
    )
  ].join("\n");
}

function buildSystemPrompt() {
  return `You are OneTeam-OneGoal AI, an OCI GenAI-powered meeting intelligence assistant for Oracle account teams.

Answer with crisp, executive-ready guidance. Prioritize AI Gist workflows, customer context, risks, opportunities, stakeholders, and next best actions.

Use the live application context below when answering account, meeting, transcript, dashboard, or brief questions.

--- ONE TEAM APPLICATION CONTEXT ---
${buildOneTeamContext()}
--- END CONTEXT ---`;
}

function isSetupError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /OCI_|\.oci|private key|tenancy|fingerprint|compartment/i.test(message);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequest;
    const message = body.message?.trim();

    if (!message) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    try {
      const response = await callOciGenAi({
        history: sanitizeHistory(body.history),
        message,
        model: body.model || "oci-llama",
        system: buildSystemPrompt()
      });

      return NextResponse.json({
        provider: "OCI GenAI",
        response
      });
    } catch (error) {
      if (!isSetupError(error)) {
        throw error;
      }

      return NextResponse.json({
        provider: "OCI GenAI",
        response:
          "OCI GenAI chat is wired in, but the server still needs OCI credentials. Set OCI_COMPARTMENT_ID, OCI_REGION, OCI_CONFIG_PROFILE, and make sure ~/.oci/config has user, tenancy, fingerprint, and key_file. After that, restart the app and ask me again."
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Chat failed."
      },
      { status: 500 }
    );
  }
}
