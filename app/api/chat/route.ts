import { NextResponse } from "next/server";
import { callOciGenAi, type ChatMessage } from "@/lib/oci-genai";
import { getAppData } from "@/lib/database";
import type { Account, AppData, Meeting, Transcript } from "@/lib/data";

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

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function messageMentionsAccount(message: string, accountName: string) {
  const escapedName = accountName
    .trim()
    .split(/\s+/)
    .map(escapeRegExp)
    .join("\\s+");
  const pattern = new RegExp(`(^|[^a-z0-9])${escapedName}('s)?([^a-z0-9]|$)`, "i");
  return pattern.test(message);
}

function findMentionedAccounts(data: AppData, message: string) {
  return data.accounts.filter((account) => messageMentionsAccount(message, account.name)).slice(0, 3);
}

function formatAccount(account: Account) {
  return [
    `- ${account.name} | ${account.industry} | HQ: ${account.headquarters} | Tier: ${account.tier} | Engagement: ${account.engagementScore}`,
    `  Summary: ${account.summary}`,
    `  Strategic initiatives: ${account.strategicInitiatives.join("; ")}`,
    `  Current products: ${account.currentProducts.join("; ")}`,
    `  Open opportunities: ${account.openOpportunities.join("; ")}`,
    `  Oracle opportunities: ${account.oracleOpportunities.join("; ")}`,
    `  Notes: ${account.notes}`,
    `  Recent news: ${account.recentNews.join("; ")}`
  ].join("\n");
}

function formatMeeting(meeting: Meeting) {
  return [
    `- ${meeting.date} | ${meeting.title} | ${meeting.type}`,
    `  Summary: ${meeting.summary}`,
    `  Topics: ${meeting.topics.join("; ")}`,
    `  Decisions: ${meeting.decisions.join("; ")}`,
    `  Actions: ${meeting.actionItems.join("; ")}`,
    `  Risks: ${meeting.risks.join("; ")}`,
    `  Opportunities: ${meeting.opportunities.join("; ")}`,
    `  Next steps: ${meeting.nextSteps.join("; ")}`
  ].join("\n");
}

function formatTranscript(transcript: Transcript) {
  return [
    `- ${transcript.uploadedAt} | ${transcript.title} | ${transcript.source}`,
    `  Summary: ${transcript.extracted.summary}`,
    `  Topics: ${transcript.extracted.topics.join("; ")}`,
    `  Decisions: ${transcript.extracted.decisions.join("; ")}`,
    `  Actions: ${transcript.extracted.actionItems.join("; ")}`
  ].join("\n");
}

function buildFocusedAccountContext(data: AppData, message: string) {
  const accounts = findMentionedAccounts(data, message);

  if (!accounts.length) {
    return "";
  }

  const accountIds = new Set(accounts.map((account) => account.id));
  const relatedMeetings = data.meetings.filter((meeting) => accountIds.has(meeting.accountId)).slice(0, 10);
  const relatedTranscripts = data.transcripts.filter((transcript) => accountIds.has(transcript.accountId)).slice(0, 6);

  return [
    "Requested account context:",
    ...accounts.map(formatAccount),
    "",
    "Requested account meetings:",
    ...(relatedMeetings.length ? relatedMeetings.map(formatMeeting) : ["- No meetings found for the requested account."]),
    "",
    "Requested account transcripts:",
    ...(relatedTranscripts.length ? relatedTranscripts.map(formatTranscript) : ["- No transcripts found for the requested account."])
  ].join("\n");
}

function buildOneTeamContext(message: string) {
  const data = getAppData();
  const topAccounts = [...data.accounts].sort((a, b) => b.engagementScore - a.engagementScore).slice(0, 12);
  const upcomingMeetings = data.meetings.slice(0, 6);
  const productInterest = data.productInterest.slice(0, 8);
  const transcripts = data.transcripts.slice(0, 4);
  const focusedContext = buildFocusedAccountContext(data, message);

  return [
    `Total accounts: ${data.accounts.length}`,
    "",
    focusedContext,
    focusedContext ? "" : undefined,
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
  ]
    .filter((line): line is string => typeof line === "string")
    .join("\n");
}

function buildSystemPrompt(message: string) {
  return `You are OneTeam-OneGoal AI, an OCI GenAI-powered meeting intelligence assistant for Oracle account teams.

Answer with crisp, executive-ready guidance. Prioritize AI Gist workflows, customer context, risks, opportunities, stakeholders, and next best actions.

If the user names a specific account, prioritize the requested account context over the generic top-account summary.

When account-specific meetings or transcripts are sparse or missing, do not leave sections blank. Use the account profile, strategic initiatives, opportunities, public signals, and clear assumptions to populate useful guidance.

Use the live application context below when answering account, meeting, transcript, dashboard, or brief questions.

--- ONE TEAM APPLICATION CONTEXT ---
${buildOneTeamContext(message)}
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
        system: buildSystemPrompt(message)
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
