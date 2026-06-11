"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Bot,
  BrainCircuit,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardPaste,
  Clock3,
  CloudUpload,
  Database,
  FileText,
  Hash,
  Home,
  LayoutDashboard,
  ListChecks,
  LockKeyhole,
  Loader2,
  MessageSquareText,
  MessageCircle,
  Network,
  MapPin,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
  Users,
  WandSparkles,
  X,
  type LucideIcon
} from "lucide-react";
import {
  type Account,
  type AppData,
  type Meeting,
  type Transcript
} from "@/lib/data";

type ViewId =
  | "home"
  | "dashboard"
  | "accounts"
  | "meetings"
  | "brief";

const navItems = [
  { id: "home", href: "/", label: "Home", icon: Home },
  { id: "dashboard", href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "accounts", href: "/accounts", label: "Accounts", icon: Building2 },
  { id: "meetings", href: "/meetings", label: "Meetings", icon: CalendarDays },
  { id: "brief", href: "/brief", label: "AI Gist", icon: Bot }
] satisfies { id: ViewId; href: string; label: string; icon: LucideIcon }[];

const teamColors = [
  "bg-red-50 text-oracle-700 border-red-100",
  "bg-emerald-50 text-emerald-700 border-emerald-100",
  "bg-sky-50 text-sky-700 border-sky-100",
  "bg-amber-50 text-amber-700 border-amber-100",
  "bg-violet-50 text-violet-700 border-violet-100",
  "bg-slate-100 text-slate-700 border-slate-200"
];

const MEETING_CALENDAR_YEAR = 2026;

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

function getTodayKey() {
  const today = new Date();
  return `${today.getFullYear()}-${padDatePart(today.getMonth() + 1)}-${padDatePart(today.getDate())}`;
}

function monthKeyFromDateKey(dateKey: string) {
  return dateKey.slice(0, 7);
}

function addMonths(monthKey: string, offset: number) {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month - 1 + offset, 1);
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}`;
}

function formatDateLabel(dateKey: string, month: "short" | "long" = "long") {
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString("en-US", {
    month,
    day: "numeric",
    year: "numeric"
  });
}

const DashboardCharts = dynamic(
  () => import("./dashboard-charts").then((module) => module.DashboardCharts),
  {
    ssr: false,
    loading: () => (
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="h-[330px] rounded-lg border border-slate-200 bg-white/80 p-4 shadow-soft" />
        <div className="h-[330px] rounded-lg border border-slate-200 bg-white/80 p-4 shadow-soft" />
      </section>
    )
  }
);

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Pill({
  children,
  tone = "slate"
}: {
  children: React.ReactNode;
  tone?: "slate" | "red" | "green" | "blue" | "amber";
}) {
  const tones = {
    slate: "border-slate-200 bg-slate-50 text-slate-700",
    red: "border-red-100 bg-red-50 text-oracle-700",
    green: "border-emerald-100 bg-emerald-50 text-emerald-700",
    blue: "border-sky-100 bg-sky-50 text-sky-700",
    amber: "border-amber-100 bg-amber-50 text-amber-700"
  };

  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium", tones[tone])}>
      {children}
    </span>
  );
}

function Card({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={cn("rounded-lg border border-slate-200 bg-white p-5 shadow-soft", className)}>{children}</section>;
}

function SectionHeader({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="mb-1 text-xs font-semibold uppercase text-oracle-600">{eyebrow}</p> : null}
        <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
        {description ? <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

function MetricCard({
  label,
  value,
  delta,
  icon: Icon,
  tone
}: {
  label: string;
  value: string;
  delta: string;
  icon: LucideIcon;
  tone: string;
}) {
  return (
    <Card className="min-h-36">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
        </div>
        <span className={cn("inline-flex h-11 w-11 items-center justify-center rounded-md", tone)}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-4 flex items-center gap-2 text-sm text-slate-600">
        <ArrowUpRight className="h-4 w-4 text-emerald-600" />
        {delta}
      </p>
    </Card>
  );
}

function ProgressBar({
  value,
  color = "bg-oracle-500"
}: {
  value: number;
  color?: string;
}) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div className={cn("h-full rounded-full", color)} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  );
}

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 placeholder:text-slate-400",
        props.className
      )}
    />
  );
}

function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn("h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950", props.className)}
    />
  );
}

function PrimaryButton({
  children,
  disabled,
  icon: Icon,
  onClick,
  type = "button"
}: {
  children: React.ReactNode;
  disabled?: boolean;
  icon?: LucideIcon;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-oracle-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-oracle-600 disabled:cursor-not-allowed disabled:opacity-50"
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  icon: Icon,
  onClick
}: {
  children: React.ReactNode;
  icon?: LucideIcon;
  onClick?: () => void;
}) {
  return (
    <button
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
      onClick={onClick}
      type="button"
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </button>
  );
}

type AssistantMessage = {
  role: "user" | "assistant";
  content: string;
  provider?: string;
};

const chatModels = [
  { id: "oci-llama", label: "LLaMA 4 Maverick" },
  { id: "oci-gemini-pro", label: "Gemini 2.5 Pro" },
  { id: "oci-grok-3", label: "Grok 3" },
  { id: "oci-cohere-a", label: "Cohere Command A" }
];

const chatSuggestions = [
  "Create an AI Gist for Microsoft using account history, meetings, and transcript context",
  "Summarize Amazon OCI migration risks and next best actions",
  "Prepare Nvidia database benchmark follow-up talking points",
  "Create a Snowflake governance roundtable brief"
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map((index) => (
        <span
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
          key={index}
          style={{ animationDelay: `${index * 0.12}s` }}
        />
      ))}
    </div>
  );
}

function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("oci-llama");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const openChat = () => setOpen(true);
    window.addEventListener("oneteam:open-chat", openChat);
    return () => window.removeEventListener("oneteam:open-chat", openChat);
  }, []);

  useEffect(() => {
    if (open) {
      window.setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text?: string) {
    const message = (text ?? input).trim();

    if (!message || loading) {
      return;
    }

    const userMessage: AssistantMessage = { role: "user", content: message };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message,
          model,
          history: messages
        })
      });
      const data = (await response.json()) as { response?: string; provider?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Chat failed.");
      }

      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: data.response || "I could not generate a response.",
          provider: data.provider || "OCI GenAI"
        }
      ]);
    } catch (error) {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: error instanceof Error ? error.message : "Chat failed.",
          provider: "OCI GenAI"
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        aria-label={open ? "Close AI chat" : "Open AI chat"}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-white shadow-2xl transition hover:bg-oracle-600"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>

      {open ? (
        <section className="fixed bottom-24 right-5 z-50 flex h-[560px] w-[min(390px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center gap-3 bg-slate-950 px-4 py-3 text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10">
              <Bot className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">OneTeam AI</p>
              <p className="text-xs text-white/60">Powered by OCI GenAI</p>
            </div>
            {messages.length ? (
              <button
                className="text-xs text-white/55 transition hover:text-white"
                onClick={() => setMessages([])}
                type="button"
              >
                Clear
              </button>
            ) : null}
          </div>

          <div className="border-b border-slate-100 px-3 py-2">
            <select
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700"
              onChange={(event) => setModel(event.target.value)}
              value={model}
            >
              {chatModels.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} · OCI
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col justify-center text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-red-50 text-oracle-700">
                  <WandSparkles className="h-6 w-6" />
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-900">Ask about your meetings</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  I know accounts, transcripts, product interest, and AI Gist workflows.
                </p>
                <div className="mt-5 space-y-2">
                  {chatSuggestions.map((suggestion) => (
                    <button
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-left text-xs font-medium text-slate-600 transition hover:border-oracle-200 hover:bg-red-50 hover:text-oracle-700"
                      key={suggestion}
                      onClick={() => send(suggestion)}
                      type="button"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message, index) => (
                  <div
                    className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
                    key={`${message.role}-${index}`}
                  >
                    <div
                      className={cn(
                        "max-w-[84%] rounded-lg px-3 py-2 text-sm leading-6",
                        message.role === "user"
                          ? "bg-oracle-500 text-white"
                          : "bg-slate-100 text-slate-700"
                      )}
                    >
                      {message.content.split("\n").map((line, lineIndex) => (
                        <span key={`${line}-${lineIndex}`}>
                          {line}
                          {lineIndex < message.content.split("\n").length - 1 ? <br /> : null}
                        </span>
                      ))}
                      {message.role === "assistant" && message.provider ? (
                        <span className="mt-2 block text-[10px] font-medium uppercase text-slate-400">
                          {message.provider}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
                {loading ? (
                  <div className="flex justify-start">
                    <div className="rounded-lg bg-slate-100">
                      <TypingDots />
                    </div>
                  </div>
                ) : null}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 p-3">
            <div className="flex items-end gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-oracle-200">
              <textarea
                className="max-h-24 min-h-9 flex-1 resize-none bg-transparent py-1 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    send();
                  }
                }}
                placeholder="Ask for a gist, risk, or next step..."
                ref={inputRef}
                rows={1}
                value={input}
              />
              <button
                className="flex h-8 w-8 flex-none items-center justify-center rounded-md bg-slate-950 text-white transition hover:bg-oracle-600 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={!input.trim() || loading}
                onClick={() => send()}
                type="button"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-slate-400">Enter to send · Shift Enter for newline</p>
          </div>
        </section>
      ) : null}
    </>
  );
}

function BriefSection({
  title,
  items
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="border-t border-slate-100 py-4">
      <h4 className="text-sm font-semibold text-slate-950">{title}</h4>
      <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-600">
        {items.map((item, index) => (
          <li className="flex gap-2" key={`${title}-${index}-${item}`}>
            <CheckCircle2 className="mt-1 h-4 w-4 flex-none text-emerald-600" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function renderInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);

    if (boldMatch) {
      return (
        <strong className="font-semibold text-slate-950" key={`${part}-${index}`}>
          {boldMatch[1]}
        </strong>
      );
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

function GeneratedGistText({ content }: { content: string }) {
  return (
    <div className="rounded-md border border-red-100 bg-red-50 p-4 text-sm leading-6 text-slate-700">
      {content.split("\n").map((line, index) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div className="h-2" key={`blank-${index}`} />;
        }

        const heading = trimmed.match(/^#{1,4}\s+(.+)$/);
        const boldHeading = trimmed.match(/^\*\*([^*]+)\*\*$/);
        const numberedItem = trimmed.match(/^(\d+\.)\s+(.+)$/);
        const bulletItem = trimmed.match(/^[-*]\s+(.+)$/);

        if (heading || boldHeading) {
          return (
            <h5 className="mt-4 first:mt-0 text-base font-semibold text-slate-950" key={`heading-${index}`}>
              {heading?.[1] ?? boldHeading?.[1]}
            </h5>
          );
        }

        if (numberedItem || bulletItem) {
          return (
            <p className="mb-2 pl-4 last:mb-0" key={`item-${index}`}>
              {numberedItem ? <span className="mr-2 font-semibold text-slate-950">{numberedItem[1]}</span> : <span className="mr-2 text-oracle-700">-</span>}
              {renderInlineMarkdown(numberedItem?.[2] ?? bulletItem?.[1] ?? trimmed)}
            </p>
          );
        }

        return (
          <p className="mb-2 last:mb-0" key={`line-${index}`}>
            {renderInlineMarkdown(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

function uniqueItems(items: string[]) {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
}

function populatedItems(items: string[], fallback: string[]) {
  const unique = uniqueItems(items);
  return unique.length ? unique : fallback;
}

function buildBrief(account: Account, objective: string, participants: string, meetings: Meeting[], transcripts: Transcript[]) {
  const participantText = participants.trim() || "customer executives and internal account team";
  const recentMeetings = [...meetings].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  const latestTranscript = [...transcripts].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))[0];
  const meetingHighlights = recentMeetings.map((meeting) => `${meeting.date}: ${meeting.summary}`);
  const actionItems = recentMeetings.flatMap((meeting) => meeting.actionItems);
  const risks = recentMeetings.flatMap((meeting) => meeting.risks);
  const meetingOpportunities = recentMeetings.flatMap((meeting) => meeting.opportunities);
  const nextSteps = recentMeetings.flatMap((meeting) => meeting.nextSteps);
  const stakeholders = uniqueItems([
    ...recentMeetings.flatMap((meeting) => meeting.attendees),
    ...recentMeetings.flatMap((meeting) => meeting.internalTeam),
    ...participantText.split(",")
  ]);
  const transcriptSignals = transcripts.flatMap((transcript) => [
    `${transcript.title}: ${transcript.extracted.summary}`,
    ...transcript.extracted.decisions.map((decision) => `Transcript decision: ${decision}`),
    ...transcript.extracted.actionItems.map((action) => `Transcript action: ${action}`)
  ]);

  return {
    summary: [
      `${account.name} is showing strong buying signals around ${account.openOpportunities[0].toLowerCase()}.`,
      `The immediate objective is to ${objective.toLowerCase() || "align on next steps"} with ${participantText}.`,
      latestTranscript
        ? `Latest uploaded source: ${latestTranscript.title} highlights ${latestTranscript.extracted.summary.toLowerCase()}`
        : `No uploaded transcript is available for ${account.name}; use account profile, meeting history, and opportunity signals as the preparation baseline.`,
      `Focus the meeting on measurable outcomes, existing technical constraints, and a clear path to executive approval.`
    ],
    background: [
      account.summary,
      `Current Oracle footprint includes ${account.currentProducts.join(", ")}.`,
      `Strategic initiatives include ${account.strategicInitiatives.join(", ")}.`,
      `Recent public signals: ${account.recentNews[0]}`
    ],
    highlights: populatedItems(meetingHighlights, [
      `No prior meeting notes are linked to ${account.name}; start from account summary, strategic initiatives, and open opportunities.`,
      "Confirm relationship history and stakeholder priorities during the next customer conversation.",
      "Use the meeting to create durable shared context for future account-team prep."
    ]),
    transcriptSignals: populatedItems(transcriptSignals, [
      `No uploaded transcript extraction is linked to ${account.name}.`,
      "Capture decisions, action items, and topic tags from the next customer call.",
      "Use account profile and meeting notes until a transcript source is uploaded."
    ]),
    actionItems: populatedItems(actionItems, [
      `Confirm success criteria for ${account.openOpportunities[0]}.`,
      "Share a one-page reference architecture and implementation sequence.",
      "Identify executive sponsor, technical owner, and procurement approver."
    ]),
    risks: populatedItems(risks, [
      "Decision timeline may slip without a clearly quantified business case.",
      "Competing platform evaluations could slow alignment across technical teams.",
      "Legacy integrations may require Services support before production rollout."
    ]),
    opportunities: populatedItems([...account.openOpportunities, ...meetingOpportunities], account.openOpportunities),
    stakeholders: populatedItems(stakeholders.map((stakeholder) => `Engage ${stakeholder}`), [
      "Economic buyer: confirm during discovery",
      "Technical owner: confirm during discovery",
      "Risk owner: confirm during discovery"
    ]),
    talkingPoints: [
      `Show how ${account.oracleOpportunities[0]} supports current initiatives.`,
      "Anchor the discussion in prior customer pain points rather than product-first messaging.",
      "Use the timeline to remind stakeholders that Oracle has continuity across every prior conversation."
    ],
    solutions: account.oracleOpportunities,
    questions: [
      "Which outcome must be visible to executives within the first 90 days?",
      "What data, security, or architecture constraints could block production adoption?",
      "Who needs to approve the next milestone, and what evidence do they need?"
    ],
    followUps: populatedItems(nextSteps, [
      "Send meeting recap within 24 hours.",
      "Assign every action item to a named owner.",
      "Schedule technical validation before procurement review."
    ]),
    agenda: [
      "5 min: business objective and participant alignment",
      "10 min: recap previous decisions and open action items",
      "15 min: solution options and risk mitigation",
      "10 min: success criteria, owners, and next steps"
    ]
  };
}

type DataProps = {
  data: AppData;
};

export function HomeView() {
  const router = useRouter();
  const intelligenceBlocks = [
    {
      title: "Account Intelligence",
      text: "AI-ready account profiles combine priorities, opportunities, product footprint, public signals, and engagement history.",
      icon: Building2
    },
    {
      title: "Meeting Gist Generation",
      text: "OCI GenAI turns account history, transcripts, and open actions into executive-ready preparation before the customer conversation.",
      icon: WandSparkles
    },
    {
      title: "Shared Team Context",
      text: "Sales, OCI, AI, Database, Security, and Services teams work from one customer memory instead of scattered notes.",
      icon: Users
    },
    {
      title: "Executive Dashboard",
      text: "Leadership gets one view of account coverage, meeting momentum, product interest, transcript ingestion, and next best actions.",
      icon: LayoutDashboard
    }
  ];

  return (
    <div className="min-h-[calc(100vh-128px)] py-10">
      <section className="grid min-h-[calc(100vh-188px)] gap-8 xl:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.65fr)] xl:items-center">
        <div>
          <Pill tone="red">OCI GenAI meeting intelligence</Pill>
          <p className="mt-7 text-sm font-semibold uppercase text-oracle-700">AI-Driven Account Alignment and Meeting Intelligence System</p>
          <h1 className="mt-4 max-w-5xl text-5xl font-semibold leading-tight text-slate-950 sm:text-6xl">
            oneteam-onegoal
          </h1>
          <p className="mt-5 text-2xl font-semibold text-slate-800">Teams Aligned. Meetings Prepared.</p>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-700">
            OneTeam-OneGoal combines account intelligence, meeting history, transcript extraction, and OCI GenAI into a single preparation system built for Oracle account teams.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <PrimaryButton icon={WandSparkles} onClick={() => router.push("/brief")}>
              Generate AI Gist
            </PrimaryButton>
            <SecondaryButton icon={LayoutDashboard} onClick={() => router.push("/dashboard")}>
              View Dashboard
            </SecondaryButton>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              ["100", "account profiles"],
              ["12 mo", "meeting calendar"],
              ["OCI", "GenAI powered"]
            ].map(([value, label]) => (
              <div className="border-l border-oracle-200 bg-white/60 px-4 py-3" key={label}>
                <p className="text-3xl font-semibold text-slate-950">{value}</p>
                <p className="mt-1 text-sm font-medium text-slate-600">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white/90 p-5 shadow-soft backdrop-blur">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-red-50 text-oracle-700">
                <BrainCircuit className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-950">OneTeam intelligence loop</p>
                <p className="text-xs text-slate-500">Accounts, meetings, transcripts, actions, and AI gists</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {intelligenceBlocks.map(({ title, text, icon: Icon }) => (
                <div className="rounded-md border border-slate-100 bg-slate-50 p-4" key={title}>
                  <Icon className="h-5 w-5 text-oracle-600" />
                  <p className="mt-3 text-sm font-semibold text-slate-950">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white/80 p-4 shadow-soft backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-white">
                  <MessageCircle className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-950">Ask the assistant</p>
                  <p className="text-xs text-slate-500">Bottom-right chat, powered by OCI GenAI</p>
                </div>
              </div>
              <SecondaryButton icon={MessageCircle} onClick={() => window.dispatchEvent(new Event("oneteam:open-chat"))}>
                Open Chat
              </SecondaryButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

type HeadquartersCoordinate = {
  latitude: number;
  longitude: number;
  region: string;
};

const headquartersCoordinates: Record<string, HeadquartersCoordinate> = {
  "Redmond, WA": { latitude: 47.674, longitude: -122.1215, region: "North America" },
  "Seattle, WA": { latitude: 47.6062, longitude: -122.3321, region: "North America" },
  "Mountain View, CA": { latitude: 37.3861, longitude: -122.0839, region: "North America" },
  "Los Gatos, CA": { latitude: 37.2358, longitude: -121.9624, region: "North America" },
  "Austin, TX": { latitude: 30.2672, longitude: -97.7431, region: "North America" },
  "San Jose, CA": { latitude: 37.3382, longitude: -121.8863, region: "North America" },
  "Santa Clara, CA": { latitude: 37.3541, longitude: -121.9552, region: "North America" },
  "San Francisco, CA": { latitude: 37.7749, longitude: -122.4194, region: "North America" },
  "New York, NY": { latitude: 40.7128, longitude: -74.006, region: "North America" },
  "Chicago, IL": { latitude: 41.8781, longitude: -87.6298, region: "North America" },
  "Dallas, TX": { latitude: 32.7767, longitude: -96.797, region: "North America" },
  "Boston, MA": { latitude: 42.3601, longitude: -71.0589, region: "North America" }
};

function projectHeadquarters({ latitude, longitude }: HeadquartersCoordinate) {
  const minLongitude = -125;
  const maxLongitude = -66;
  const minLatitude = 24;
  const maxLatitude = 50;

  return {
    x: 58 + ((longitude - minLongitude) / (maxLongitude - minLongitude)) * 884,
    y: 54 + ((maxLatitude - latitude) / (maxLatitude - minLatitude)) * 392
  };
}

function AccountHeadquartersMap({ accounts }: { accounts: Account[] }) {
  const locations = useMemo(() => {
    const grouped = new Map<
      string,
      {
        city: string;
        coordinate: HeadquartersCoordinate;
        count: number;
        accounts: string[];
        engagementTotal: number;
      }
    >();

    for (const account of accounts) {
      const coordinate = headquartersCoordinates[account.headquarters];

      if (!coordinate) {
        continue;
      }

      const existing =
        grouped.get(account.headquarters) ??
        {
          city: account.headquarters,
          coordinate,
          count: 0,
          accounts: [],
          engagementTotal: 0
        };

      existing.count += 1;
      existing.accounts.push(account.name);
      existing.engagementTotal += account.engagementScore;
      grouped.set(account.headquarters, existing);
    }

    return [...grouped.values()].sort((a, b) => b.count - a.count || a.city.localeCompare(b.city));
  }, [accounts]);
  const maxCount = Math.max(...locations.map((location) => location.count), 1);
  const totalMappedAccounts = locations.reduce((total, location) => total + location.count, 0);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <SectionHeader
        title="U.S. account headquarters"
        description="Customer coverage plotted from U.S. headquarters of Accounts."
        action={
          <Pill tone="blue">
            {totalMappedAccounts} mapped accounts
          </Pill>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          <svg
            aria-label="United States map of account headquarters"
            className="h-[360px] w-full"
            role="img"
            viewBox="0 0 1000 500"
          >
            <rect fill="#f8fafc" height="500" width="1000" />
            {[145, 275, 405, 535, 665, 795, 925].map((x) => (
              <line key={`long-${x}`} stroke="#e2e8f0" strokeDasharray="4 8" strokeWidth="1" x1={x} x2={x} y1="42" y2="458" />
            ))}
            {[110, 190, 270, 350, 430].map((y) => (
              <line key={`lat-${y}`} stroke="#e2e8f0" strokeDasharray="4 8" strokeWidth="1" x1="42" x2="958" y1={y} y2={y} />
            ))}

            <g fill="#e5e7eb" stroke="#cbd5e1" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
              <path d="M95 126 L150 92 L242 78 L317 84 L371 103 L448 104 L528 119 L607 119 L690 101 L748 116 L801 145 L864 164 L913 212 L897 257 L846 287 L807 342 L760 353 L719 329 L680 338 L640 368 L579 362 L533 387 L481 374 L435 390 L383 374 L329 383 L289 356 L246 352 L206 325 L178 286 L135 262 L113 212 Z" />
              <path d="M171 113 L197 103 L210 126 L191 150 L162 146 Z" fill="#eef2f7" />
              <path d="M637 386 C668 385 703 401 714 427 C680 441 643 432 617 412 Z" fill="#eef2f7" />
            </g>
            <g stroke="#d6e0ea" strokeDasharray="6 10" strokeWidth="1.4">
              <path d="M185 100 L211 334" />
              <path d="M293 88 L308 370" />
              <path d="M401 106 L390 379" />
              <path d="M515 118 L500 376" />
              <path d="M627 118 L603 358" />
              <path d="M739 116 L707 333" />
              <path d="M124 203 L893 213" />
              <path d="M168 280 L840 287" />
              <path d="M255 349 L760 345" />
            </g>

            <g>
              {locations.map((location) => {
                const { x, y } = projectHeadquarters(location.coordinate);
                const radius = 7 + (location.count / maxCount) * 18;
                const topAccounts = location.accounts.slice(0, 4).join(", ");

                return (
                  <g key={location.city} transform={`translate(${x} ${y})`}>
                    <circle fill="#C74634" fillOpacity="0.16" r={radius + 10} />
                    <circle fill="#C74634" r={radius} stroke="#ffffff" strokeWidth="3" />
                    <text
                      fill="#0f172a"
                      fontSize="12"
                      fontWeight="700"
                      textAnchor="middle"
                      x="0"
                      y={radius + 20}
                    >
                      {location.count}
                    </text>
                    <title>{`${location.city}: ${location.count} accounts. Examples: ${topAccounts}`}</title>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-md border border-red-100 bg-red-50 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-oracle-700">
              <MapPin className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-950">{locations.length} headquarters locations</p>
              <p className="text-xs text-slate-600">Grouped by account headquarters field</p>
            </div>
          </div>

          <div className="max-h-[292px] space-y-3 overflow-auto pr-1">
            {locations.slice(0, 8).map((location) => {
              const averageEngagement = Math.round(location.engagementTotal / location.count);

              return (
                <div className="rounded-md border border-slate-100 bg-slate-50 p-3" key={location.city}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-950">
                      <MapPin className="h-4 w-4 flex-none text-oracle-600" />
                      <span className="truncate">{location.city}</span>
                    </p>
                    <span className="text-sm font-semibold text-oracle-700">{location.count}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <ProgressBar value={(location.count / maxCount) * 100} />
                    <span className="w-10 text-right text-xs text-slate-500">{averageEngagement}</span>
                  </div>
                  <p className="mt-2 truncate text-xs text-slate-500">
                    {location.accounts.slice(0, 3).join(", ")}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export function DashboardView({ data }: DataProps) {
  const router = useRouter();
  const { accounts, activityFeed, meetings, productInterest, transcripts } = data;
  const todayKey = getTodayKey();
  const todayLabel = formatDateLabel(todayKey);
  const upcomingMeetings = meetings.filter((meeting) => meeting.date > todayKey);
  const generatedGists = activityFeed.filter((activity) => /AI (brief|gist) generated/i.test(activity));
  const totalActionItems = meetings.reduce((total, meeting) => total + meeting.actionItems.length, 0);
  const meetingsByAccount = meetings.reduce((map, meeting) => {
    const accountMeetings = map.get(meeting.accountId) ?? [];
    accountMeetings.push(meeting);
    map.set(meeting.accountId, accountMeetings);
    return map;
  }, new Map<string, Meeting[]>());
  const engagedCustomers = accounts
    .map((account) => {
      const accountMeetings = meetingsByAccount.get(account.id) ?? [];
      const actionCount = accountMeetings.reduce((total, meeting) => total + meeting.actionItems.length, 0);
      const opportunityCount = accountMeetings.reduce((total, meeting) => total + meeting.opportunities.length, 0);
      const score = Math.min(100, Math.round(accountMeetings.length * 9 + actionCount * 2 + opportunityCount * 3));

      return {
        account,
        meetingCount: accountMeetings.length,
        score
      };
    })
    .filter((item) => item.meetingCount > 0)
    .sort((a, b) => b.score - a.score || b.meetingCount - a.meetingCount)
    .slice(0, 8);
  const frequency = Array.from({ length: 12 }, (_, index) => {
    const monthKey = `${MEETING_CALENDAR_YEAR}-${String(index + 1).padStart(2, "0")}`;
    const value = meetings.filter((meeting) => meeting.date.slice(0, 7) === monthKey).length;
    const label = new Date(`${monthKey}-01T00:00:00`).toLocaleString("en-US", { month: "short" });

    return [label, value] as const;
  });
  const maxFrequency = Math.max(1, ...frequency.map(([, value]) => Number(value)));
  const busiestMonth = frequency.reduce((best, item) => (item[1] > best[1] ? item : best), frequency[0]);
  const opportunityTrends = [
    {
      title: "Cloud migration",
      keywords: ["cloud", "oci", "migration", "compute", "support rewards", "economics"],
      text: "OCI, migration, and workload economics"
    },
    {
      title: "Database modernization",
      keywords: ["database", "autonomous", "exadata", "latency", "workload"],
      text: "Autonomous DB, Exadata, and workload signals"
    },
    {
      title: "AI knowledge retrieval",
      keywords: ["ai", "rag", "embedding", "vector", "knowledge", "retrieval"],
      text: "AI Gist, RAG, and Vector Search signals"
    }
  ].map((trend) => {
    const count = meetings.filter((meeting) => {
      const searchable = `${meeting.title} ${meeting.summary} ${meeting.topics.join(" ")} ${meeting.opportunities.join(" ")}`.toLowerCase();
      return trend.keywords.some((keyword) => searchable.includes(keyword));
    }).length;

    return {
      ...trend,
      count,
      percent: meetings.length ? Math.round((count / meetings.length) * 100) : 0
    };
  });

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Dashboard"
        title="Meeting intelligence operations"
        description="Monitor account coverage, meeting activity, AI Gist generation, product interest, and transcript ingestion."
        action={<PrimaryButton icon={WandSparkles} onClick={() => router.push("/brief")}>Generate AI Gist</PrimaryButton>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Total Accounts" value={accounts.length.toString()} delta="Loaded from local SQLite accounts" icon={Building2} tone="bg-red-50 text-oracle-700" />
        <MetricCard label="Total Meetings" value={meetings.length.toString()} delta={`${busiestMonth[1]} in busiest month (${busiestMonth[0]})`} icon={CalendarDays} tone="bg-sky-50 text-sky-700" />
        <MetricCard label="Upcoming Meetings" value={upcomingMeetings.length.toString()} delta={`After ${todayLabel}`} icon={Clock3} tone="bg-amber-50 text-amber-700" />
        <MetricCard label="AI Gists" value={generatedGists.length.toString()} delta="Generated briefs in activity feed" icon={Bot} tone="bg-emerald-50 text-emerald-700" />
        <MetricCard label="Open Actions" value={totalActionItems.toString()} delta="Derived from meeting action items" icon={ListChecks} tone="bg-violet-50 text-violet-700" />
      </div>

      <AccountHeadquartersMap accounts={accounts} />

      <DashboardCharts accounts={accounts} meetings={meetings} productInterest={data.productInterest} transcripts={transcripts} />

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <SectionHeader title="Most engaged customers" />
          <div className="space-y-4">
            {engagedCustomers.map(({ account, score, meetingCount }) => (
              <button
                className="grid w-full grid-cols-[130px_minmax(0,1fr)_40px] items-center gap-3 border-t border-slate-100 pt-4 text-left first:border-t-0 first:pt-0"
                key={account.id}
                onClick={() => router.push(`/accounts?account=${account.id}`)}
                type="button"
              >
                <p className="truncate text-sm font-semibold text-slate-950">{account.name}</p>
                <ProgressBar value={score} />
                <p className="text-right text-sm font-medium text-slate-600">{meetingCount}</p>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHeader title="Meeting frequency" />
          <div className="space-y-4">
            {frequency.map(([month, value]) => (
              <div className="grid grid-cols-[44px_minmax(0,1fr)_52px] items-center gap-3" key={month}>
                <p className="text-sm font-medium text-slate-600">{month}</p>
                <div className="h-8 overflow-hidden rounded-md bg-slate-100">
                  <div className="flex h-full items-center rounded-md bg-slate-950 px-3 text-xs font-semibold text-white" style={{ width: `${(Number(value) / maxFrequency) * 100}%` }}>
                    {value}
                  </div>
                </div>
                <p className="text-right text-sm text-slate-500">mtgs</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <SectionHeader title="Product interest heatmap" />
          <div className="space-y-4">
            {productInterest.map((item, index) => (
              <div className="space-y-2" key={item.product}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950">{item.product}</p>
                  <p className="text-sm text-slate-500">{item.value}%</p>
                </div>
                <ProgressBar
                  value={item.value}
                  color={index % 3 === 0 ? "bg-oracle-500" : index % 3 === 1 ? "bg-sky-500" : "bg-emerald-500"}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHeader title="Opportunity trends" />
          <div className="grid gap-4 md:grid-cols-3">
            {opportunityTrends.map((trend) => (
              <div className="rounded-md border border-slate-100 bg-slate-50 p-4" key={trend.title}>
                <p className="text-sm font-semibold text-slate-950">{trend.title}</p>
                <p className="mt-4 text-3xl font-semibold text-oracle-600">{trend.percent}%</p>
                <p className="mt-2 text-xs leading-5 text-slate-600">{trend.count} SQLite meeting signals · {trend.text}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <SectionHeader title="Recent activity" />
          <div className="space-y-4">
            {activityFeed.map((activity, index) => (
              <div className="flex gap-3 border-t border-slate-100 pt-4 first:border-t-0 first:pt-0" key={activity}>
                <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-md bg-red-50 text-oracle-700">
                  <Activity className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-900">{activity}</p>
                  <p className="mt-1 text-xs text-slate-500">{index + 1}h ago</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHeader title="Recent uploaded transcripts" />
          <div className="space-y-4">
            {transcripts.map((transcript) => (
              <div className="border-t border-slate-100 pt-4 first:border-t-0 first:pt-0" key={transcript.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-semibold text-slate-950">{transcript.title}</p>
                  <Pill tone="green">{transcript.source}</Pill>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-600">{transcript.extracted.summary}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}

export function AccountsView({ data }: DataProps) {
  const router = useRouter();
  const { accounts, timelineEvents } = data;
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState("All");
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0].id);

  useEffect(() => {
    const accountId = new URLSearchParams(window.location.search).get("account");
    if (accountId && accounts.some((account) => account.id === accountId)) {
      setSelectedAccountId(accountId);
    }
  }, [accounts]);

  const selected = accounts.find((account) => account.id === selectedAccountId) ?? accounts[0];
  const filteredAccounts = useMemo(
    () =>
      accounts.filter((account) => {
        const matchesQuery = `${account.name} ${account.industry} ${account.owner} ${account.openOpportunities.join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesTier = tier === "All" || account.tier === tier;
        return matchesQuery && matchesTier;
      }),
    [query, tier]
  );
  const visibleAccounts = filteredAccounts.slice(0, 50);
  const tierOneAccounts = accounts.filter((account) => account.tier === "Tier 1").length;
  const averageEngagement = Math.round(accounts.reduce((total, account) => total + account.engagementScore, 0) / accounts.length);
  const selectedTimeline = timelineEvents.slice(0, 4);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Accounts"
        title="Account list"
        description="A TerraOptimuS-style account table for fast scanning. Select a row to review context and generate an AI Gist."
        action={
          <PrimaryButton icon={WandSparkles} onClick={() => router.push(`/brief?account=${selected.id}`)}>
            Generate AI Gist
          </PrimaryButton>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Total accounts", accounts.length.toString(), "local SQLite profiles"],
          ["Tier 1", tierOneAccounts.toString(), "priority customers"],
          ["Avg engagement", averageEngagement.toString(), "account-team score"]
        ].map(([label, value, helper]) => (
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" key={label}>
            <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
            <p className="mt-1 text-xs text-slate-500">{helper}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-lg border border-slate-200 bg-white shadow-soft">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">Account rankings</h2>
              <p className="mt-1 text-xs text-slate-500">
                Showing {visibleAccounts.length} of {filteredAccounts.length} accounts
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-[minmax(260px,1fr)_150px] lg:w-[520px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <TextInput
                  className="pl-9"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search accounts"
                  value={query}
                />
              </div>
              <SelectInput onChange={(event) => setTier(event.target.value)} value={tier}>
                <option>All</option>
                <option>Tier 1</option>
                <option>Tier 2</option>
                <option>Tier 3</option>
              </SelectInput>
            </div>
          </div>

          <div className="overflow-auto">
            <table className="w-full min-w-[1080px] border-collapse text-xs">
              <thead>
                <tr className="sticky top-0 z-10 bg-slate-50 text-left text-slate-500">
                  {["Rank", "Account", "Tier", "Industry", "HQ", "Owner", "Revenue", "Employees", "Engagement", "Meetings", "Actions", "Opportunity"].map((heading) => (
                    <th className="border-b border-slate-200 px-3 py-3 font-semibold" key={heading}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleAccounts.map((account, index) => (
                  <tr
                    className={cn(
                      "cursor-pointer border-b border-slate-100 transition",
                      selected.id === account.id ? "bg-oracle-50" : index % 2 === 0 ? "bg-white hover:bg-slate-50" : "bg-slate-50/40 hover:bg-slate-50"
                    )}
                    key={account.id}
                    onClick={() => setSelectedAccountId(account.id)}
                  >
                    <td className="px-3 py-3 font-mono text-slate-400">{index + 1}</td>
                    <td className="px-3 py-3">
                      <div className="font-semibold text-slate-950">{account.name}</div>
                      <div className="mt-0.5 text-[11px] text-slate-500">{account.website}</div>
                    </td>
                    <td className="px-3 py-3">
                      <Pill tone={account.tier === "Tier 1" ? "red" : account.tier === "Tier 2" ? "blue" : "slate"}>{account.tier}</Pill>
                    </td>
                    <td className="px-3 py-3 text-slate-600">{account.industry}</td>
                    <td className="px-3 py-3 text-slate-600">{account.headquarters}</td>
                    <td className="px-3 py-3 text-slate-600">{account.owner}</td>
                    <td className="px-3 py-3 font-medium text-slate-700">{account.revenue}</td>
                    <td className="px-3 py-3 text-right text-slate-600">{account.employeeCount}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-8 font-semibold text-slate-700">{account.engagementScore}</span>
                        <span className="w-24"><ProgressBar value={account.engagementScore} /></span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center text-slate-600">{account.meetingsCount}</td>
                    <td className="px-3 py-3 text-center text-slate-600">{account.actionItemsOpen}</td>
                    <td className="max-w-[260px] truncate px-3 py-3 text-slate-600">{account.openOpportunities[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-4">
          <Card>
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone="red">{selected.tier}</Pill>
              <Pill tone="blue">{selected.industry}</Pill>
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-slate-950">{selected.name}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{selected.summary}</p>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs uppercase text-slate-500">Owner</p>
                <p className="font-semibold text-slate-950">{selected.owner}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-500">HQ</p>
                <p className="font-semibold text-slate-950">{selected.headquarters}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-500">Revenue</p>
                <p className="font-semibold text-slate-950">{selected.revenue}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-500">Employees</p>
                <p className="font-semibold text-slate-950">{selected.employeeCount}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-2">
              <PrimaryButton icon={WandSparkles} onClick={() => router.push(`/brief?account=${selected.id}`)}>
                Generate AI Gist
              </PrimaryButton>
              <SecondaryButton icon={CalendarDays} onClick={() => router.push("/meetings")}>
                View Meeting Notes
              </SecondaryButton>
            </div>
          </Card>

          <Card>
            <SectionHeader title="AI Gist inputs" />
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Open opportunity</p>
                <p className="mt-1 text-sm leading-6 text-slate-700">{selected.openOpportunities[0]}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Current products</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selected.currentProducts.map((item) => <Pill key={item} tone="blue">{item}</Pill>)}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Recent signals</p>
                <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-600">
                  {selected.recentNews.slice(0, 2).map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </div>
          </Card>

          <Card>
            <SectionHeader title="Relationship timeline" />
            <div className="space-y-3">
              {selectedTimeline.map((event) => (
                <div className="border-t border-slate-100 pt-3 first:border-t-0 first:pt-0" key={`${event.date}-${event.title}`}>
                  <p className="text-xs font-semibold uppercase text-oracle-600">{event.date}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-950">{event.title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">{event.detail}</p>
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function MeetingDetail({ accounts, meeting }: { accounts: Account[]; meeting: Meeting }) {
  const detailGroups: { title: string; items: string[]; icon: LucideIcon }[] = [
    { title: "Discussion topics", items: meeting.topics, icon: MessageSquareText },
    { title: "Decisions", items: meeting.decisions, icon: CheckCircle2 },
    { title: "Action items", items: meeting.actionItems, icon: ListChecks },
    { title: "Risks", items: meeting.risks, icon: ShieldCheck },
    { title: "Opportunities", items: meeting.opportunities, icon: Target },
    { title: "Next steps", items: meeting.nextSteps, icon: ChevronRight }
  ];

  return (
    <Card>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Pill tone="blue">{meeting.type}</Pill>
          <h3 className="mt-3 text-2xl font-semibold text-slate-950">{meeting.title}</h3>
          <p className="mt-2 text-sm text-slate-500">{meeting.date} · Owner: {meeting.owner}</p>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">{meeting.summary}</p>
        </div>
        <Pill tone="green">{accounts.find((account) => account.id === meeting.accountId)?.name}</Pill>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {detailGroups.map(({ title, items, icon: Icon }) => (
          <div className="border-t border-slate-100 pt-4" key={title}>
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-950">
              <Icon className="h-4 w-4 text-oracle-600" />
              {title}
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Card>
  );
}

type AddMeetingForm = {
  accountId: string;
  date: string;
  title: string;
  type: string;
  owner: string;
  attendees: string;
  internalTeam: string;
  summary: string;
  topics: string;
  decisions: string;
  actionItems: string;
  risks: string;
  opportunities: string;
  nextSteps: string;
};

function createAddMeetingForm(accounts: Account[], date: string): AddMeetingForm {
  const account = accounts[0];

  return {
    accountId: account?.id ?? "",
    date,
    title: account ? `${account.name} Customer Alignment` : "Customer Alignment",
    type: "Customer Meeting",
    owner: account?.owner ?? "",
    attendees: "",
    internalTeam: account?.owner ?? "",
    summary: "",
    topics: "Business priorities, open action items, next steps",
    decisions: "",
    actionItems: "",
    risks: "",
    opportunities: "",
    nextSteps: ""
  };
}

function splitMeetingFormList(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function MeetingsView({ data }: DataProps) {
  const router = useRouter();
  const { accounts, meetings, transcripts } = data;
  const todayKey = getTodayKey();
  const todayLabel = formatDateLabel(todayKey);
  const initialMeeting = meetings.find((meeting) => meeting.date > todayKey) ?? meetings[0];
  const calendarMonths = Array.from({ length: 12 }, (_, index) => `${MEETING_CALENDAR_YEAR}-${padDatePart(index + 1)}`);
  const currentMonthKey = monthKeyFromDateKey(todayKey);
  const initialCalendarMonth = calendarMonths.includes(currentMonthKey)
    ? currentMonthKey
    : monthKeyFromDateKey(initialMeeting.date);
  const [meetingList, setMeetingList] = useState<Meeting[]>(meetings);
  const [selectedMeetingId, setSelectedMeetingId] = useState(initialMeeting.id);
  const [calendarMonth, setCalendarMonth] = useState(initialCalendarMonth);
  const [fileName, setFileName] = useState("");
  const [pastedNotes, setPastedNotes] = useState("");
  const [pasteStatus, setPasteStatus] = useState("");
  const [addMeetingOpen, setAddMeetingOpen] = useState(false);
  const [meetingForm, setMeetingForm] = useState(() => createAddMeetingForm(accounts, todayKey));
  const [meetingSaveStatus, setMeetingSaveStatus] = useState("");
  const [meetingSaveError, setMeetingSaveError] = useState("");
  const [savingMeeting, setSavingMeeting] = useState(false);

  useEffect(() => {
    setMeetingList(meetings);
    setSelectedMeetingId((current) => {
      if (meetings.some((meeting) => meeting.id === current)) {
        return current;
      }

      return (meetings.find((meeting) => meeting.date > todayKey) ?? meetings[0]).id;
    });
  }, [meetings, todayKey]);

  const defaultMeeting = meetingList.find((meeting) => meeting.date > todayKey) ?? meetingList[0];
  const selectedMeeting = meetingList.find((meeting) => meeting.id === selectedMeetingId) ?? defaultMeeting;
  const selectedAccount = accounts.find((account) => account.id === selectedMeeting.accountId);
  const selectedMeetingIsFuture = selectedMeeting.date > todayKey;
  const meetingCountsByMonth = meetingList.reduce((map, meeting) => {
    const monthKey = meeting.date.slice(0, 7);
    map.set(monthKey, (map.get(monthKey) ?? 0) + 1);
    return map;
  }, new Map<string, number>());
  const previousMonth = addMonths(calendarMonth, -1);
  const nextMonth = addMonths(calendarMonth, 1);
  const canGoPrevious = calendarMonths.includes(previousMonth);
  const canGoNext = calendarMonths.includes(nextMonth);
  const [year, month] = calendarMonth.split("-").map(Number);
  const monthStart = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const leadingDays = monthStart.getDay();
  const meetingsByDate = meetingList.reduce((map, meeting) => {
    const dayMeetings = map.get(meeting.date) ?? [];
    dayMeetings.push(meeting);
    map.set(meeting.date, dayMeetings);
    return map;
  }, new Map<string, Meeting[]>());
  const calendarCells: Array<{ date: string; day: number } | null> = [
    ...Array.from({ length: leadingDays }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      return {
        day,
        date: `${calendarMonth}-${String(day).padStart(2, "0")}`
      };
    })
  ];
  const noteSources: { title: string; text: string; icon: LucideIcon }[] = [
    {
      title: "Manual Entry",
      text: "Sales reps enter notes, decisions, action items, and customer updates.",
      icon: FileText
    },
    {
      title: "Zoom Transcript Upload",
      text: "TXT, DOCX, PDF, and Zoom exports are processed into structured memory.",
      icon: Upload
    },
    {
      title: "Rep Notes Upload",
      text: "Call notes, meeting summaries, emails, and customer updates are linked to accounts.",
      icon: MessageSquareText
    }
  ];
  const pastedNoteLength = pastedNotes.trim().length;

  function updateMeetingForm(field: keyof AddMeetingForm, value: string) {
    setMeetingForm((current) => ({ ...current, [field]: value }));
  }

  function openAddMeeting() {
    const account = selectedAccount ?? accounts[0];
    setMeetingForm((current) => ({
      ...current,
      accountId: account?.id ?? current.accountId,
      title: account ? `${account.name} Customer Alignment` : current.title,
      owner: account?.owner ?? current.owner,
      internalTeam: current.internalTeam.trim() ? current.internalTeam : account?.owner ?? ""
    }));
    setMeetingSaveError("");
    setMeetingSaveStatus("");
    setAddMeetingOpen(true);
  }

  async function submitAddMeeting(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMeetingSaveError("");
    setMeetingSaveStatus("");

    if (!meetingForm.title.trim() || !meetingForm.date || !meetingForm.accountId || !meetingForm.owner.trim()) {
      setMeetingSaveError("Title, date, account, and owner are required.");
      return;
    }

    setSavingMeeting(true);

    try {
      const response = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...meetingForm,
          attendees: splitMeetingFormList(meetingForm.attendees),
          internalTeam: splitMeetingFormList(meetingForm.internalTeam),
          topics: splitMeetingFormList(meetingForm.topics),
          decisions: splitMeetingFormList(meetingForm.decisions),
          actionItems: splitMeetingFormList(meetingForm.actionItems),
          risks: splitMeetingFormList(meetingForm.risks),
          opportunities: splitMeetingFormList(meetingForm.opportunities),
          nextSteps: splitMeetingFormList(meetingForm.nextSteps)
        })
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to add meeting.");
      }

      const createdMeeting = result.meeting as Meeting;
      setMeetingList((current) => (
        [...current.filter((meeting) => meeting.id !== createdMeeting.id), createdMeeting]
          .sort((left, right) => left.date.localeCompare(right.date))
      ));
      setSelectedMeetingId(createdMeeting.id);
      setCalendarMonth(monthKeyFromDateKey(createdMeeting.date));
      setMeetingForm(createAddMeetingForm(accounts, createdMeeting.date));
      setMeetingSaveStatus(`Added ${createdMeeting.title}.`);
      setAddMeetingOpen(false);
    } catch (error) {
      setMeetingSaveError(error instanceof Error ? error.message : "Unable to add meeting.");
    } finally {
      setSavingMeeting(false);
    }
  }

  async function pasteMeetingNotesFromClipboard() {
    setPasteStatus("");

    if (!navigator.clipboard?.readText) {
      setPasteStatus("Clipboard access is unavailable. Click the notes box and press Cmd+V.");
      return;
    }

    try {
      const text = await navigator.clipboard.readText();

      if (!text.trim()) {
        setPasteStatus("Clipboard is empty. Copy meeting notes, then try again.");
        return;
      }

      setPastedNotes(text);
      setPasteStatus("Pasted meeting notes from clipboard.");
    } catch {
      setPasteStatus("Browser blocked clipboard access. Click the notes box and press Cmd+V.");
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Meetings"
        title="Meeting calendar"
        description={`Browse all 12 months of ${MEETING_CALENDAR_YEAR}. Meetings through ${todayLabel} open historical notes; meetings after ${todayLabel} send teams to AI Gist prep.`}
        action={<PrimaryButton icon={Plus} onClick={openAddMeeting}>Add Meeting</PrimaryButton>}
      />
      {meetingSaveStatus ? (
        <div className="rounded-md border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {meetingSaveStatus}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="rounded-lg border border-slate-200 bg-white shadow-soft">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-4">
            <div>
              <div className="flex items-center gap-2">
                <button
                  aria-label="Previous month"
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={!canGoPrevious}
                  onClick={() => setCalendarMonth(previousMonth)}
                  type="button"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <h2 className="min-w-44 text-center text-base font-semibold text-slate-950">
                  {monthStart.toLocaleString("en-US", { month: "long", year: "numeric" })}
                </h2>
                <button
                  aria-label="Next month"
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={!canGoNext}
                  onClick={() => setCalendarMonth(nextMonth)}
                  type="button"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-500">{meetingList.length} customer interactions across Jan-Dec {MEETING_CALENDAR_YEAR}</p>
            </div>
            <div className="overflow-x-auto pb-1">
              <div className="grid min-w-[680px] grid-cols-12 gap-2">
              {calendarMonths.map((monthKey) => (
                <button
                  className={cn(
                    "min-w-0 rounded-md border px-2 py-2 text-xs font-semibold transition",
                    calendarMonth === monthKey
                      ? "border-oracle-200 bg-oracle-50 text-oracle-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  )}
                  key={monthKey}
                  onClick={() => setCalendarMonth(monthKey)}
                  type="button"
                >
                  <span className="block">{new Date(`${monthKey}-01T00:00:00`).toLocaleString("en-US", { month: "short" })}</span>
                  <span className="mt-0.5 block text-[10px] font-medium opacity-70">{meetingCountsByMonth.get(monthKey) ?? 0}</span>
                </button>
              ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div className="border-r border-slate-200 px-3 py-2 last:border-r-0" key={day}>{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendarCells.map((cell, index) => {
              const dayMeetings = cell ? meetingsByDate.get(cell.date) ?? [] : [];

              return (
                <div
                  className={cn(
                    "min-h-32 border-b border-r border-slate-100 p-2 last:border-r-0",
                    !cell && "bg-slate-50/60",
                    cell?.date === selectedMeeting.date && "bg-oracle-50/70"
                  )}
                  key={cell?.date ?? `blank-${index}`}
                >
                  {cell ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500">{cell.day}</span>
                        {dayMeetings.length ? <span className="h-2 w-2 rounded-full bg-oracle-500" /> : null}
                      </div>
                      <div className="mt-2 space-y-1.5">
                        {dayMeetings.map((meeting) => {
                          const isFutureMeeting = meeting.date > todayKey;

                          return (
                            <button
                              className={cn(
                                "w-full rounded-md border px-2 py-1.5 text-left text-[11px] leading-4 transition",
                                selectedMeeting.id === meeting.id && !isFutureMeeting
                                  ? "border-oracle-300 bg-white text-oracle-700 shadow-sm"
                                  : isFutureMeeting
                                    ? "border-red-100 bg-red-50 text-oracle-800 hover:border-oracle-300 hover:bg-white"
                                    : "border-slate-200 bg-white text-slate-700 hover:border-oracle-200 hover:text-oracle-700"
                              )}
                              key={meeting.id}
                              onClick={() => {
                                if (isFutureMeeting) {
                                  router.push(`/brief?account=${meeting.accountId}&meeting=${meeting.id}`);
                                  return;
                                }

                                setSelectedMeetingId(meeting.id);
                              }}
                              type="button"
                            >
                              <span className="flex items-center justify-between gap-2">
                                <span className="truncate font-semibold">{meeting.title}</span>
                                <span className={cn("shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold", isFutureMeeting ? "bg-white text-oracle-700" : "bg-slate-100 text-slate-500")}>
                                  {isFutureMeeting ? "AI Gist" : "Notes"}
                                </span>
                              </span>
                              <span className="block truncate text-slate-500">{accounts.find((account) => account.id === meeting.accountId)?.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-6">
          {selectedMeetingIsFuture ? (
            <Card>
              <SectionHeader
                title="Future meeting prep"
                description={`${selectedAccount?.name ?? "Account"} · ${selectedMeeting.date} · ${selectedMeeting.internalTeam.join(", ")}`}
                action={<PrimaryButton icon={WandSparkles} onClick={() => router.push(`/brief?account=${selectedMeeting.accountId}&meeting=${selectedMeeting.id}`)}>Generate AI Gist</PrimaryButton>}
              />
              <div className="space-y-4 text-sm leading-6 text-slate-600">
                <div className="rounded-md border border-red-100 bg-red-50 p-4">
                  <p className="font-semibold text-oracle-800">This meeting is after {todayLabel}.</p>
                  <p className="mt-2 text-oracle-800/80">
                    Use AI Gist before the customer conversation so the team walks in with historical notes, open actions,
                    public signals, and Oracle recommendations aligned.
                  </p>
                </div>
                <p><span className="font-semibold text-slate-950">Meeting:</span> {selectedMeeting.title}</p>
                <p><span className="font-semibold text-slate-950">Participants:</span> {selectedMeeting.attendees.join(", ")}</p>
                <p><span className="font-semibold text-slate-950">Prep focus:</span> {selectedMeeting.topics.join(", ")}</p>
                <p><span className="font-semibold text-slate-950">Owner:</span> {selectedMeeting.owner}</p>
              </div>
            </Card>
          ) : (
            <>
              <MeetingDetail accounts={accounts} meeting={selectedMeeting} />

              <Card>
                <SectionHeader
                  title="Historical note"
                  description={`${selectedAccount?.name ?? "Account"} · Captured on or before ${todayLabel}`}
                />
                <div className="space-y-3 text-sm leading-6 text-slate-600">
                  <p><span className="font-semibold text-slate-950">Summary:</span> {selectedMeeting.summary}</p>
                  <p><span className="font-semibold text-slate-950">Attendees:</span> {selectedMeeting.attendees.join(", ")}</p>
                  <p><span className="font-semibold text-slate-950">Owner:</span> {selectedMeeting.owner}</p>
                </div>
              </Card>
            </>
          )}

          <Card>
            <SectionHeader title="Upload meeting source" />
            <div className="space-y-4">
              <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition hover:border-oracle-300 hover:bg-red-50">
                <CloudUpload className="h-8 w-8 text-oracle-600" />
                <span className="mt-3 text-sm font-semibold text-slate-950">Upload Zoom notes or transcript</span>
                <span className="mt-1 text-xs text-slate-500">TXT, DOCX, PDF, Zoom exports, call notes, or emails</span>
                <input
                  className="sr-only"
                  onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")}
                  type="file"
                />
              </label>

              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">Paste meeting notes</p>
                    <p className="mt-1 text-xs text-slate-500">Copy notes from email, Zoom, Slack, or a document, then paste here.</p>
                  </div>
                  <button
                    className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-oracle-200 hover:bg-red-50 hover:text-oracle-700"
                    onClick={pasteMeetingNotesFromClipboard}
                    type="button"
                  >
                    <ClipboardPaste className="h-4 w-4" />
                    Paste from clipboard
                  </button>
                </div>
                <textarea
                  className="mt-3 min-h-32 w-full resize-y rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:border-oracle-300"
                  onChange={(event) => {
                    setPastedNotes(event.target.value);
                    setPasteStatus("");
                  }}
                  onPaste={() => setPasteStatus("Pasted meeting notes into the notes box.")}
                  placeholder="Paste meeting notes, transcript excerpts, decisions, action items, or customer updates..."
                  value={pastedNotes}
                />
                <div className="mt-2 flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                  <span>{pastedNoteLength ? `${pastedNoteLength.toLocaleString("en-US")} characters captured` : "No pasted notes yet"}</span>
                  {pastedNotes ? (
                    <button
                      className="text-left font-semibold text-slate-600 transition hover:text-oracle-700 sm:text-right"
                      onClick={() => {
                        setPastedNotes("");
                        setPasteStatus("");
                      }}
                      type="button"
                    >
                      Clear pasted notes
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
            {fileName ? (
              <div className="mt-4 rounded-md border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-800">
                Extracted summary, action items, decisions, and topics from {fileName}.
              </div>
            ) : null}
            {pastedNoteLength ? (
              <div className="mt-4 rounded-md border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-800">
                Captured pasted meeting notes for {selectedAccount?.name ?? "this account"}. Ready to extract summary, action items, decisions, and topics.
              </div>
            ) : null}
            {pasteStatus ? (
              <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                {pasteStatus}
              </div>
            ) : null}
          </Card>

          <Card>
            <SectionHeader title="Latest transcript extraction" />
            <div className="space-y-4">
              {transcripts.slice(0, 3).map((transcript) => (
                <div className="border-t border-slate-100 pt-4 first:border-t-0 first:pt-0" key={transcript.id}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-950">{transcript.title}</p>
                    <Pill tone="green">{transcript.source}</Pill>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{transcript.extracted.summary}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <SectionHeader title="Meeting note sources" />
            <div className="space-y-4">
              {noteSources.map(({ title, text, icon: Icon }) => (
                <div className="flex gap-3 border-t border-slate-100 pt-4 first:border-t-0 first:pt-0" key={title}>
                  <Icon className="mt-0.5 h-5 w-5 flex-none text-oracle-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>

      {addMeetingOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/45 px-4 py-8">
          <div className="w-full max-w-4xl rounded-lg border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
              <div>
                <p className="text-xs font-semibold uppercase text-oracle-600">Add Meeting</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">Create customer meeting</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">Saved meetings are added to the local SQLite account history and become available for AI Gist prep.</p>
              </div>
              <button
                aria-label="Close add meeting"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-950"
                onClick={() => setAddMeetingOpen(false)}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form className="space-y-5 p-5" onSubmit={submitAddMeeting}>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Title">
                  <TextInput
                    onChange={(event) => updateMeetingForm("title", event.target.value)}
                    placeholder="Executive alignment"
                    required
                    value={meetingForm.title}
                  />
                </Field>
                <Field label="Account">
                  <SelectInput
                    onChange={(event) => {
                      const account = accounts.find((item) => item.id === event.target.value);
                      setMeetingForm((current) => ({
                        ...current,
                        accountId: event.target.value,
                        title: account ? `${account.name} Customer Alignment` : current.title,
                        owner: account?.owner ?? current.owner,
                        internalTeam: current.internalTeam.trim() ? current.internalTeam : account?.owner ?? ""
                      }));
                    }}
                    required
                    value={meetingForm.accountId}
                  >
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>{account.name}</option>
                    ))}
                  </SelectInput>
                </Field>
                <Field label="Date">
                  <TextInput
                    max={`${MEETING_CALENDAR_YEAR}-12-31`}
                    min={`${MEETING_CALENDAR_YEAR}-01-01`}
                    onChange={(event) => updateMeetingForm("date", event.target.value)}
                    required
                    type="date"
                    value={meetingForm.date}
                  />
                </Field>
                <Field label="Type">
                  <SelectInput onChange={(event) => updateMeetingForm("type", event.target.value)} value={meetingForm.type}>
                    <option>Customer Meeting</option>
                    <option>Executive Briefing</option>
                    <option>Technical Workshop</option>
                    <option>QBR</option>
                    <option>Architecture Review</option>
                    <option>Renewal Review</option>
                  </SelectInput>
                </Field>
                <Field label="Owner">
                  <TextInput
                    onChange={(event) => updateMeetingForm("owner", event.target.value)}
                    placeholder="Account owner"
                    required
                    value={meetingForm.owner}
                  />
                </Field>
                <Field label="Internal Team">
                  <TextInput
                    onChange={(event) => updateMeetingForm("internalTeam", event.target.value)}
                    placeholder="AE, SE, AI Specialist"
                    value={meetingForm.internalTeam}
                  />
                </Field>
              </div>

              <Field label="Attendees">
                <TextInput
                  onChange={(event) => updateMeetingForm("attendees", event.target.value)}
                  placeholder="CIO, VP Data Platform, Security Director"
                  value={meetingForm.attendees}
                />
              </Field>

              <Field label="Summary">
                <textarea
                  className="min-h-24 w-full resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-950 placeholder:text-slate-400"
                  onChange={(event) => updateMeetingForm("summary", event.target.value)}
                  placeholder="What this meeting is about, or what happened if this is a historical note."
                  value={meetingForm.summary}
                />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ["topics", "Topics", "OCI roadmap, data governance, next steps"],
                  ["decisions", "Decisions", "Decision captured, decision pending"],
                  ["actionItems", "Action Items", "Send recap, schedule workshop"],
                  ["risks", "Risks", "Security review, migration timeline"],
                  ["opportunities", "Opportunities", "OCI expansion, AI Vector Search pilot"],
                  ["nextSteps", "Next Steps", "Confirm owners, schedule follow-up"]
                ].map(([field, label, placeholder]) => (
                  <Field key={field} label={label}>
                    <textarea
                      className="min-h-24 w-full resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-950 placeholder:text-slate-400"
                      onChange={(event) => updateMeetingForm(field as keyof AddMeetingForm, event.target.value)}
                      placeholder={`${placeholder} (comma or new line separated)`}
                      value={meetingForm[field as keyof AddMeetingForm]}
                    />
                  </Field>
                ))}
              </div>

              {meetingSaveError ? (
                <div className="rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-oracle-800">
                  {meetingSaveError}
                </div>
              ) : null}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
                <SecondaryButton onClick={() => setAddMeetingOpen(false)}>Cancel</SecondaryButton>
                <PrimaryButton disabled={savingMeeting} icon={savingMeeting ? Loader2 : Plus} type="submit">
                  {savingMeeting ? "Adding..." : "Add Meeting"}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
export function BriefGeneratorView({ data }: DataProps) {
  const { accounts, meetings, transcripts } = data;
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0].id);
  const [objective, setObjective] = useState("Align on AI knowledge layer pilot and next-step owners");
  const [participants, setParticipants] = useState("CIO, VP Data Platform, Security Director, Oracle AE, AI Specialist");
  const [meetingDate, setMeetingDate] = useState("2026-06-18");
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aiGist, setAiGist] = useState("");
  const [gistProvider, setGistProvider] = useState("OCI GenAI");
  const [gistError, setGistError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const meetingId = params.get("meeting");
    const meeting = meetingId ? meetings.find((item) => item.id === meetingId) : undefined;

    if (meeting) {
      setSelectedAccountId(meeting.accountId);
      setMeetingDate(meeting.date);
      setObjective(meeting.title);
      setParticipants([...meeting.attendees, ...meeting.internalTeam].join(", "));
      return;
    }

    const accountId = params.get("account");
    if (accountId && accounts.some((account) => account.id === accountId)) {
      setSelectedAccountId(accountId);
    }
  }, [accounts, meetings]);

  const selected = accounts.find((account) => account.id === selectedAccountId) ?? accounts[0];
  const relatedMeetings = meetings.filter((meeting) => meeting.accountId === selected.id);
  const relatedTranscripts = transcripts.filter((transcript) => transcript.accountId === selected.id);
  const brief = buildBrief(selected, objective, participants, relatedMeetings, relatedTranscripts);

  useEffect(() => {
    setGenerated(false);
    setAiGist("");
    setGistError("");
  }, [selectedAccountId, objective, participants, meetingDate]);

  async function generateAiGist() {
    if (generating) {
      return;
    }

    setGenerating(true);
    setGenerated(false);
    setAiGist("");
    setGistError("");

    const message = [
      `Create an AI Gist for ${selected.name}.`,
      `Meeting date: ${meetingDate}.`,
      `Meeting objective: ${objective}.`,
      `Participants: ${participants}.`,
      "Use the application account, meeting, and transcript context for this customer.",
      "If a source is missing for this account, populate the section from account profile, opportunities, initiatives, and reasonable next-step assumptions instead of leaving it blank.",
      "Return only the final AI Gist with these concise executive sections: Executive Summary, Customer Context, Risks, Opportunities, Recommended Talking Points, Suggested Questions, and Next Actions."
    ].join("\n");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message,
          model: "oci-llama",
          history: []
        })
      });
      const result = (await response.json()) as { response?: string; provider?: string; error?: string };

      if (!response.ok) {
        throw new Error(result.error || "AI Gist generation failed.");
      }

      const responseText = result.response || "";

      if (/OCI GenAI chat is wired in|server still needs OCI credentials/i.test(responseText)) {
        throw new Error(responseText);
      }

      if (!responseText.trim()) {
        throw new Error("OCI GenAI returned an empty gist.");
      }

      setAiGist(responseText);
      setGistProvider(result.provider || "OCI GenAI");
      setGenerated(true);
    } catch (error) {
      setGistError(error instanceof Error ? error.message : "AI Gist generation failed.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Flagship feature"
        title="AI Gist"
        description="Select an account, meeting objective, date, and participants. The system combines historical notes, stakeholder history, transcripts, public signals, and account intelligence into a concise executive-ready gist."
      />

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <Card>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-oracle-500 text-white">
              <WandSparkles className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-slate-950">Generate preparation gist</h3>
              <p className="text-xs text-slate-500">Prepared in under two minutes</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <Field label="Account">
              <SelectInput onChange={(event) => setSelectedAccountId(event.target.value)} value={selected.id}>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Upcoming Meeting Date">
              <TextInput onChange={(event) => setMeetingDate(event.target.value)} type="date" value={meetingDate} />
            </Field>
            <Field label="Meeting Objective">
              <TextInput onChange={(event) => setObjective(event.target.value)} value={objective} />
            </Field>
            <Field label="Meeting Participants">
              <textarea
                className="min-h-24 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400"
                onChange={(event) => setParticipants(event.target.value)}
                value={participants}
              />
            </Field>

            <PrimaryButton disabled={generating} icon={generating ? Loader2 : Sparkles} onClick={generateAiGist}>
              {generating ? "Generating..." : "Generate AI Gist"}
            </PrimaryButton>
          </div>

          <div className="mt-6 rounded-md border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Internal prompt inputs</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Historical meeting notes, previous action items, uploaded Zoom transcripts, account profile, stakeholder
              history, public company information, and industry trends.
            </p>
          </div>
        </Card>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Pill tone="red">AI generated</Pill>
              <h3 className="mt-3 text-2xl font-semibold text-slate-950">{selected.name} meeting preparation gist</h3>
              <p className="mt-2 text-sm text-slate-500">{meetingDate} · {participants}</p>
            </div>
            <SecondaryButton icon={FileText}>Export Gist</SecondaryButton>
          </div>

          {generated ? (
            <div>
              <div className="border-t border-slate-100 py-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-slate-950">Generated Gist</h4>
                  <span className="text-[10px] font-semibold uppercase text-slate-400">{gistProvider}</span>
                </div>
                <GeneratedGistText content={aiGist} />
              </div>
            </div>
          ) : gistError ? (
            <div>
              <div className="border-t border-slate-100 py-4">
                <div className="rounded-md border border-red-100 bg-red-50 p-4 text-sm leading-6 text-oracle-800">
                  {gistError}
                </div>
              </div>
              <BriefSection title="Executive Summary" items={brief.summary} />
              <BriefSection title="Customer Background" items={brief.background} />
              <BriefSection title="Previous Meeting Highlights" items={brief.highlights} />
              <BriefSection title="Transcript Signals" items={brief.transcriptSignals} />
              <BriefSection title="Open Action Items" items={brief.actionItems} />
              <BriefSection title="Current Opportunities" items={brief.opportunities} />
              <BriefSection title="Stakeholders" items={brief.stakeholders} />
              <BriefSection title="Risks" items={brief.risks} />
              <BriefSection title="Recent Public News" items={selected.recentNews} />
              <BriefSection title="Recommended Talking Points" items={brief.talkingPoints} />
              <BriefSection title="Potential Oracle Solutions" items={brief.solutions} />
              <BriefSection title="Suggested Questions" items={brief.questions} />
              <BriefSection title="Follow-Up Recommendations" items={brief.followUps} />
              <BriefSection title="AI Generated Meeting Agenda" items={brief.agenda} />
            </div>
          ) : (
            <div className="border-t border-slate-100 py-8 text-center">
              {generating ? (
                <div className="flex flex-col items-center gap-3 text-sm text-slate-600">
                  <Loader2 className="h-5 w-5 animate-spin text-oracle-600" />
                  Generating with LLaMA 4 Maverick on OCI GenAI...
                </div>
              ) : (
                <p className="text-sm text-slate-500">Choose the meeting inputs, then generate the AI Gist.</p>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export function KnowledgeView({ data }: DataProps) {
  const { teamSpaces } = data;
  const knowledgeSteps: { title: string; text: string; icon: LucideIcon }[] = [
    {
      title: "Extract entities",
      text: "Stakeholders, products, competitors, dates, risks, and commitments.",
      icon: Hash
    },
    {
      title: "Store embeddings",
      text: "Notes and transcripts become retrievable vectors for RAG workflows.",
      icon: Database
    },
    {
      title: "Link to account",
      text: "Every insight is tied to accounts, meetings, owners, and teams.",
      icon: Network
    }
  ];
  const collaborationFeatures: { title: string; text: string; icon: LucideIcon }[] = [
    {
      title: "Shared notes",
      text: "Cross-functional customer notes with mentions, tags, and activity history.",
      icon: MessageSquareText
    },
    {
      title: "Recurring themes",
      text: "Automatic detection of repeated risks, product interests, and objections.",
      icon: Activity
    },
    {
      title: "Action item tracking",
      text: "Open commitments are linked to owner, account, meeting, and due date.",
      icon: ListChecks
    }
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Knowledge layer"
        title="Unified customer memory"
        description="Every meeting note creates searchable context, account links, recurring themes, stakeholder mentions, product interests, and open action item tracking."
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
          <div className="grid gap-4 md:grid-cols-3">
            {knowledgeSteps.map(({ title, text, icon: Icon }) => (
              <div className="rounded-md border border-slate-100 bg-slate-50 p-4" key={title}>
                <Icon className="h-5 w-5 text-oracle-600" />
                <p className="mt-3 text-sm font-semibold text-slate-950">{title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <SectionHeader title="Relationship graph" />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[
                ["Microsoft", "AI Vector Search", "CIO sponsor"],
                ["Amazon", "OCI migration", "Finance owner"],
                ["Nvidia", "Autonomous DB", "Database architect"],
                ["CrowdStrike", "Security Zones", "CISO stakeholder"],
                ["Snowflake", "Oracle Analytics", "Data platform lead"],
                ["Walmart", "Services rollout", "Program owner"]
              ].map(([account, product, stakeholder]) => (
                <div className="rounded-md border border-slate-200 bg-white p-4" key={account}>
                  <p className="text-sm font-semibold text-slate-950">{account}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Pill tone="red">{product}</Pill>
                    <Pill tone="blue">{stakeholder}</Pill>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Card>
          <SectionHeader title="Team collaboration" />
          <div className="space-y-4">
            {teamSpaces.map((team, index) => (
              <div className="border-t border-slate-100 pt-4 first:border-t-0 first:pt-0" key={team.name}>
                <div className="flex items-center gap-3">
                  <span className={cn("inline-flex h-9 w-9 items-center justify-center rounded-md border", teamColors[index])}>
                    <Users className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{team.name}</p>
                    <p className="text-xs text-slate-500">{team.update}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {team.tags.map((tag) => (
                    <Pill key={tag}>{tag}</Pill>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {collaborationFeatures.map(({ title, text, icon: Icon }) => (
          <Card key={title}>
            <Icon className="h-5 w-5 text-oracle-600" />
            <p className="mt-3 text-sm font-semibold text-slate-950">{title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function SearchView({ data }: DataProps) {
  const { accounts, meetings, transcripts } = data;
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("AI");

  useEffect(() => {
    const query = new URLSearchParams(window.location.search).get("q");
    if (query) {
      setSearchQuery(query);
    }
  }, []);

  const normalizedQuery = searchQuery.toLowerCase();
  const results = useMemo(() => {
    const accountResults = accounts
      .filter((account) =>
        `${account.name} ${account.industry} ${account.strategicInitiatives.join(" ")} ${account.openOpportunities.join(" ")} ${account.notes}`
          .toLowerCase()
          .includes(normalizedQuery)
      )
      .slice(0, 8)
      .map((account) => ({ type: "Account", title: account.name, detail: account.summary, id: account.id }));

    const meetingResults = meetings
      .filter((meeting) =>
        `${meeting.title} ${meeting.summary} ${meeting.topics.join(" ")} ${meeting.actionItems.join(" ")}`
          .toLowerCase()
          .includes(normalizedQuery)
      )
      .map((meeting) => ({ type: "Meeting", title: meeting.title, detail: meeting.summary, id: meeting.accountId }));

    const transcriptResults = transcripts
      .filter((transcript) =>
        `${transcript.title} ${transcript.extracted.summary} ${transcript.extracted.topics.join(" ")}`
          .toLowerCase()
          .includes(normalizedQuery)
      )
      .map((transcript) => ({ type: "Transcript", title: transcript.title, detail: transcript.extracted.summary, id: transcript.accountId }));

    return [...accountResults, ...meetingResults, ...transcriptResults].slice(0, 12);
  }, [normalizedQuery]);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Global search"
        title="Notion-style customer search"
        description="Search accounts, meetings, stakeholders, action items, products, transcripts, notes, and AI summaries from one command surface."
      />

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            className="h-14 w-full rounded-md border border-slate-200 bg-slate-50 pl-12 pr-4 text-base text-slate-950 placeholder:text-slate-400"
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search customer history, action items, products, or transcripts"
            value={searchQuery}
          />
        </div>

        <div className="mt-5 overflow-hidden rounded-md border border-slate-200">
          {(searchQuery ? results : results.slice(0, 6)).map((result) => (
            <button
              className="flex w-full items-center gap-4 border-t border-slate-100 bg-white p-4 text-left first:border-t-0 hover:bg-slate-50"
              key={`${result.type}-${result.title}`}
              onClick={() => {
                router.push(`/accounts?account=${result.id}`);
              }}
              type="button"
            >
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-md bg-slate-100 text-slate-700">
                {result.type === "Account" ? <Building2 className="h-4 w-4" /> : result.type === "Meeting" ? <CalendarDays className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-sm font-semibold text-slate-950">{result.title}</span>
                  <Pill tone={result.type === "Account" ? "red" : result.type === "Meeting" ? "blue" : "green"}>{result.type}</Pill>
                </span>
                <span className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{result.detail}</span>
              </span>
              <ChevronRight className="h-4 w-4 flex-none text-slate-400" />
            </button>
          ))}
          {results.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">No results yet. Try searching for AI, OCI, security, database, or an account name.</div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

export function SettingsView() {
  const settingsCards: { title: string; label: string; text: string; icon: LucideIcon }[] = [
    {
      title: "Authentication",
      label: "Clerk or Auth.js",
      text: "SSO-ready user management with account team roles.",
      icon: LockKeyhole
    },
    {
      title: "AI",
      label: "OpenAI APIs",
      text: "Brief generation, extraction, embeddings, and RAG orchestration.",
      icon: BrainCircuit
    },
    {
      title: "Storage",
      label: "PostgreSQL and Supabase",
      text: "Accounts, meetings, transcripts, embeddings, and files.",
      icon: Database
    }
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Settings"
        title="Workspace configuration"
        description="Configure authentication, AI providers, vector storage, file ingestion, and enterprise controls."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        {settingsCards.map(({ title, label, text, icon: Icon }) => (
          <Card key={title}>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-950">{title}</p>
                <p className="text-xs text-oracle-600">{label}</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">{text}</p>
          </Card>
        ))}
      </div>

      <Card>
        <SectionHeader title="RAG architecture checklist" />
        <div className="grid gap-4 md:grid-cols-2">
          {[
            "Prisma ORM models for accounts, meetings, transcripts, stakeholders, action items, and embeddings",
            "OpenAI extraction pipeline for summaries, decisions, topics, risks, and follow-up recommendations",
            "Vector database support for semantic search across historical context",
            "Role-aware search and retrieval controls by team, account, and workspace",
            "PDF, DOCX, TXT, and Zoom export parsing with source attribution",
            "Executive-ready prompt templates for generated customer meeting gists"
          ].map((item) => (
            <div className="flex gap-3 rounded-md border border-slate-100 bg-slate-50 p-4" key={item}>
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-emerald-600" />
              <p className="text-sm leading-6 text-slate-700">{item}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function TopNavigation() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-[#1a1a1a] text-white shadow-lg">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 flex-col gap-3 py-3 xl:flex-row xl:items-center">
          <Link className="flex min-w-fit items-center gap-3" href="/">
            <Image
              alt="Oracle"
              className="h-7 w-auto object-contain"
              height={52}
              priority
              src="/oracle-logo.png"
              width={82}
            />
            <span className="flex flex-col leading-tight">
              <span className="text-lg font-semibold tracking-wide text-white">oneteam-onegoal</span>
              <span className="text-[11px] font-light tracking-wide text-white/70">
                Prepare Faster • Align Better • Win Together
              </span>
            </span>
          </Link>

          <nav className="scrollbar-thin flex min-w-0 flex-1 items-center gap-1 overflow-x-auto xl:justify-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  className={cn(
                    "flex h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-semibold transition",
                    isActive
                      ? "bg-oracle-500 text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                  href={item.href}
                  key={item.href}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      <div className="h-[6px] bg-[url('/nav-pattern.svg')] bg-cover bg-center" />
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen">
      <TopNavigation />
      <div className="mx-auto w-[80%] max-w-[1600px] py-6">{children}</div>
      <AiChatWidget />
    </main>
  );
}
