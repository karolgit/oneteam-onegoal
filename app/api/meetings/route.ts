import { NextResponse } from "next/server";
import { createMeeting, type NewMeetingInput } from "@/lib/database";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function readText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readList(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => readText(item)).filter(Boolean);
  }

  return readText(value)
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function withFallback(items: string[], fallback: string) {
  return items.length ? items : [fallback];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const title = readText(body.title);
    const date = readText(body.date);
    const accountId = readText(body.accountId);
    const owner = readText(body.owner);

    if (!title || !date || !accountId || !owner) {
      return NextResponse.json({ error: "Title, date, account, and owner are required." }, { status: 400 });
    }

    if (!datePattern.test(date)) {
      return NextResponse.json({ error: "Date must use YYYY-MM-DD format." }, { status: 400 });
    }

    const meetingInput: NewMeetingInput = {
      title,
      date,
      accountId,
      owner,
      type: readText(body.type) || "Customer Meeting",
      summary: readText(body.summary) || "Meeting added manually. Notes and outcomes will be captured as the engagement progresses.",
      attendees: withFallback(readList(body.attendees), "Customer stakeholders"),
      internalTeam: withFallback(readList(body.internalTeam), owner),
      topics: withFallback(readList(body.topics), "Agenda to be confirmed"),
      decisions: withFallback(readList(body.decisions), "No decisions captured yet"),
      actionItems: withFallback(readList(body.actionItems), "No open action items captured yet"),
      risks: withFallback(readList(body.risks), "No risks captured yet"),
      opportunities: withFallback(readList(body.opportunities), "Opportunities to be qualified"),
      nextSteps: withFallback(readList(body.nextSteps), "Confirm agenda, participants, and expected outcomes before the meeting")
    };

    return NextResponse.json({ meeting: createMeeting(meetingInput) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to add meeting." },
      { status: 500 }
    );
  }
}
