import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
  accounts as seedAccounts,
  activityFeed as seedActivityFeed,
  meetings as seedMeetings,
  productInterest as seedProductInterest,
  teamSpaces as seedTeamSpaces,
  timelineEvents as seedTimelineEvents,
  transcripts as seedTranscripts,
  type Account,
  type ActivityItem,
  type AppData,
  type Meeting,
  type ProductInterest,
  type TeamSpace,
  type TimelineEvent,
  type Transcript
} from "./data";

const dbDirectory = path.join(process.cwd(), "data");
const dbPath = path.join(dbDirectory, "oneteam-onegoal.sqlite");

let db: DatabaseSync | undefined;

function stringify(value: unknown) {
  return JSON.stringify(value);
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string") {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function getDb() {
  if (!fs.existsSync(dbDirectory)) {
    fs.mkdirSync(dbDirectory, { recursive: true });
  }

  db ??= new DatabaseSync(dbPath);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  return db;
}

function createSchema(database: DatabaseSync) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      industry TEXT NOT NULL,
      website TEXT NOT NULL,
      revenue TEXT NOT NULL,
      employee_count TEXT NOT NULL,
      headquarters TEXT NOT NULL,
      owner TEXT NOT NULL,
      tier TEXT NOT NULL,
      summary TEXT NOT NULL,
      strategic_initiatives TEXT NOT NULL,
      current_products TEXT NOT NULL,
      open_opportunities TEXT NOT NULL,
      notes TEXT NOT NULL,
      tech_stack TEXT NOT NULL,
      recent_news TEXT NOT NULL,
      industry_trends TEXT NOT NULL,
      oracle_opportunities TEXT NOT NULL,
      engagement_score INTEGER NOT NULL,
      meetings_count INTEGER NOT NULL,
      action_items_open INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS meetings (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      account_id TEXT NOT NULL,
      attendees TEXT NOT NULL,
      internal_team TEXT NOT NULL,
      type TEXT NOT NULL,
      summary TEXT NOT NULL,
      topics TEXT NOT NULL,
      decisions TEXT NOT NULL,
      action_items TEXT NOT NULL,
      risks TEXT NOT NULL,
      opportunities TEXT NOT NULL,
      next_steps TEXT NOT NULL,
      owner TEXT NOT NULL,
      FOREIGN KEY (account_id) REFERENCES accounts(id)
    );

    CREATE TABLE IF NOT EXISTS transcripts (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      title TEXT NOT NULL,
      source TEXT NOT NULL,
      uploaded_at TEXT NOT NULL,
      extracted TEXT NOT NULL,
      FOREIGN KEY (account_id) REFERENCES accounts(id)
    );

    CREATE TABLE IF NOT EXISTS activity_feed (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS team_spaces (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      tags TEXT NOT NULL,
      update_text TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS product_interest (
      product TEXT PRIMARY KEY,
      value INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS timeline_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_date TEXT NOT NULL,
      title TEXT NOT NULL,
      detail TEXT NOT NULL
    );
  `);
}

function seedDatabase(database: DatabaseSync) {
  const accountCount = database.prepare("SELECT COUNT(*) AS count FROM accounts").get() as { count: number };

  if (accountCount.count > 0) {
    return;
  }

  const insertAccount = database.prepare(`
    INSERT INTO accounts (
      id, name, industry, website, revenue, employee_count, headquarters, owner, tier, summary,
      strategic_initiatives, current_products, open_opportunities, notes, tech_stack, recent_news,
      industry_trends, oracle_opportunities, engagement_score, meetings_count, action_items_open
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMeeting = database.prepare(`
    INSERT INTO meetings (
      id, title, date, account_id, attendees, internal_team, type, summary, topics,
      decisions, action_items, risks, opportunities, next_steps, owner
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertTranscript = database.prepare(`
    INSERT INTO transcripts (id, account_id, title, source, uploaded_at, extracted)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertActivity = database.prepare("INSERT INTO activity_feed (text) VALUES (?)");
  const insertTeamSpace = database.prepare("INSERT INTO team_spaces (name, tags, update_text) VALUES (?, ?, ?)");
  const insertProductInterest = database.prepare("INSERT INTO product_interest (product, value) VALUES (?, ?)");
  const insertTimelineEvent = database.prepare("INSERT INTO timeline_events (event_date, title, detail) VALUES (?, ?, ?)");

  database.exec("BEGIN TRANSACTION;");

  try {
    for (const account of seedAccounts) {
      insertAccount.run(
        account.id,
        account.name,
        account.industry,
        account.website,
        account.revenue,
        account.employeeCount,
        account.headquarters,
        account.owner,
        account.tier,
        account.summary,
        stringify(account.strategicInitiatives),
        stringify(account.currentProducts),
        stringify(account.openOpportunities),
        account.notes,
        stringify(account.techStack),
        stringify(account.recentNews),
        stringify(account.industryTrends),
        stringify(account.oracleOpportunities),
        account.engagementScore,
        account.meetingsCount,
        account.actionItemsOpen
      );
    }

    for (const meeting of seedMeetings) {
      insertMeeting.run(
        meeting.id,
        meeting.title,
        meeting.date,
        meeting.accountId,
        stringify(meeting.attendees),
        stringify(meeting.internalTeam),
        meeting.type,
        meeting.summary,
        stringify(meeting.topics),
        stringify(meeting.decisions),
        stringify(meeting.actionItems),
        stringify(meeting.risks),
        stringify(meeting.opportunities),
        stringify(meeting.nextSteps),
        meeting.owner
      );
    }

    for (const transcript of seedTranscripts) {
      insertTranscript.run(
        transcript.id,
        transcript.accountId,
        transcript.title,
        transcript.source,
        transcript.uploadedAt,
        stringify(transcript.extracted)
      );
    }

    for (const item of seedActivityFeed) {
      insertActivity.run(item);
    }

    for (const teamSpace of seedTeamSpaces) {
      insertTeamSpace.run(teamSpace.name, stringify(teamSpace.tags), teamSpace.update);
    }

    for (const item of seedProductInterest) {
      insertProductInterest.run(item.product, item.value);
    }

    for (const event of seedTimelineEvents) {
      insertTimelineEvent.run(event.date, event.title, event.detail);
    }

    database.exec("COMMIT;");
  } catch (error) {
    database.exec("ROLLBACK;");
    throw error;
  }
}

function syncSeedMeetings(database: DatabaseSync) {
  const insertMeeting = database.prepare(`
    INSERT OR IGNORE INTO meetings (
      id, title, date, account_id, attendees, internal_team, type, summary, topics,
      decisions, action_items, risks, opportunities, next_steps, owner
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  database.exec("BEGIN TRANSACTION;");

  try {
    for (const meeting of seedMeetings) {
      insertMeeting.run(
        meeting.id,
        meeting.title,
        meeting.date,
        meeting.accountId,
        stringify(meeting.attendees),
        stringify(meeting.internalTeam),
        meeting.type,
        meeting.summary,
        stringify(meeting.topics),
        stringify(meeting.decisions),
        stringify(meeting.actionItems),
        stringify(meeting.risks),
        stringify(meeting.opportunities),
        stringify(meeting.nextSteps),
        meeting.owner
      );
    }

    database.exec("COMMIT;");
  } catch (error) {
    database.exec("ROLLBACK;");
    throw error;
  }
}

function syncAccountTiers(database: DatabaseSync) {
  database.exec(`
    UPDATE accounts SET tier = 'Tier 1' WHERE tier = 'Strategic';
    UPDATE accounts SET tier = 'Tier 2' WHERE tier = 'Enterprise';
    UPDATE accounts SET tier = 'Tier 3' WHERE tier = 'Growth';
  `);
}

function initializeDatabase() {
  const database = getDb();
  createSchema(database);
  seedDatabase(database);
  syncAccountTiers(database);
  syncSeedMeetings(database);
  return database;
}

export type NewMeetingInput = Omit<Meeting, "id">;

function createMeetingId() {
  return `mtg-user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createMeeting(input: NewMeetingInput): Meeting {
  const database = initializeDatabase();
  const account = database.prepare("SELECT id FROM accounts WHERE id = ?").get(input.accountId);

  if (!account) {
    throw new Error("Account not found.");
  }

  const meeting: Meeting = {
    id: createMeetingId(),
    title: input.title,
    date: input.date,
    accountId: input.accountId,
    attendees: input.attendees,
    internalTeam: input.internalTeam,
    type: input.type,
    summary: input.summary,
    topics: input.topics,
    decisions: input.decisions,
    actionItems: input.actionItems,
    risks: input.risks,
    opportunities: input.opportunities,
    nextSteps: input.nextSteps,
    owner: input.owner
  };

  const insertMeeting = database.prepare(`
    INSERT INTO meetings (
      id, title, date, account_id, attendees, internal_team, type, summary, topics,
      decisions, action_items, risks, opportunities, next_steps, owner
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertMeeting.run(
    meeting.id,
    meeting.title,
    meeting.date,
    meeting.accountId,
    stringify(meeting.attendees),
    stringify(meeting.internalTeam),
    meeting.type,
    meeting.summary,
    stringify(meeting.topics),
    stringify(meeting.decisions),
    stringify(meeting.actionItems),
    stringify(meeting.risks),
    stringify(meeting.opportunities),
    stringify(meeting.nextSteps),
    meeting.owner
  );

  database.prepare(`
    UPDATE accounts
    SET meetings_count = meetings_count + 1,
        action_items_open = action_items_open + ?
    WHERE id = ?
  `).run(meeting.actionItems.length, meeting.accountId);

  return meeting;
}

function readAccounts(database: DatabaseSync): Account[] {
  const rows = database.prepare("SELECT * FROM accounts ORDER BY name ASC").all() as Record<string, unknown>[];

  return rows.map((row) => ({
    id: String(row.id),
    name: String(row.name),
    industry: String(row.industry),
    website: String(row.website),
    revenue: String(row.revenue),
    employeeCount: String(row.employee_count),
    headquarters: String(row.headquarters),
    owner: String(row.owner),
    tier: row.tier as Account["tier"],
    summary: String(row.summary),
    strategicInitiatives: parseJson<string[]>(row.strategic_initiatives, []),
    currentProducts: parseJson<string[]>(row.current_products, []),
    openOpportunities: parseJson<string[]>(row.open_opportunities, []),
    notes: String(row.notes),
    techStack: parseJson<string[]>(row.tech_stack, []),
    recentNews: parseJson<string[]>(row.recent_news, []),
    industryTrends: parseJson<string[]>(row.industry_trends, []),
    oracleOpportunities: parseJson<string[]>(row.oracle_opportunities, []),
    engagementScore: Number(row.engagement_score),
    meetingsCount: Number(row.meetings_count),
    actionItemsOpen: Number(row.action_items_open)
  }));
}

function readMeetings(database: DatabaseSync): Meeting[] {
  const rows = database.prepare("SELECT * FROM meetings ORDER BY date ASC").all() as Record<string, unknown>[];

  return rows.map((row) => ({
    id: String(row.id),
    title: String(row.title),
    date: String(row.date),
    accountId: String(row.account_id),
    attendees: parseJson<string[]>(row.attendees, []),
    internalTeam: parseJson<string[]>(row.internal_team, []),
    type: String(row.type),
    summary: String(row.summary),
    topics: parseJson<string[]>(row.topics, []),
    decisions: parseJson<string[]>(row.decisions, []),
    actionItems: parseJson<string[]>(row.action_items, []),
    risks: parseJson<string[]>(row.risks, []),
    opportunities: parseJson<string[]>(row.opportunities, []),
    nextSteps: parseJson<string[]>(row.next_steps, []),
    owner: String(row.owner)
  }));
}

function readTranscripts(database: DatabaseSync): Transcript[] {
  const rows = database.prepare("SELECT * FROM transcripts ORDER BY uploaded_at DESC").all() as Record<string, unknown>[];

  return rows.map((row) => ({
    id: String(row.id),
    accountId: String(row.account_id),
    title: String(row.title),
    source: row.source as Transcript["source"],
    uploadedAt: String(row.uploaded_at),
    extracted: parseJson<Transcript["extracted"]>(row.extracted, {
      summary: "",
      actionItems: [],
      decisions: [],
      topics: []
    })
  }));
}

function readActivityFeed(database: DatabaseSync): ActivityItem[] {
  const rows = database.prepare("SELECT text FROM activity_feed ORDER BY id ASC").all() as { text: string }[];
  return rows.map((row) => row.text);
}

function readTeamSpaces(database: DatabaseSync): TeamSpace[] {
  const rows = database.prepare("SELECT * FROM team_spaces ORDER BY id ASC").all() as Record<string, unknown>[];

  return rows.map((row) => ({
    name: String(row.name),
    tags: parseJson<string[]>(row.tags, []),
    update: String(row.update_text)
  }));
}

function readProductInterest(database: DatabaseSync): ProductInterest[] {
  const rows = database.prepare("SELECT product, value FROM product_interest ORDER BY value DESC").all() as Record<string, unknown>[];

  return rows.map((row) => ({
    product: String(row.product),
    value: Number(row.value)
  }));
}

function readTimelineEvents(database: DatabaseSync): TimelineEvent[] {
  const rows = database.prepare("SELECT * FROM timeline_events ORDER BY id ASC").all() as Record<string, unknown>[];

  return rows.map((row) => ({
    date: String(row.event_date),
    title: String(row.title),
    detail: String(row.detail)
  }));
}

export function getAppData(): AppData {
  const database = initializeDatabase();

  return {
    accounts: readAccounts(database),
    meetings: readMeetings(database),
    transcripts: readTranscripts(database),
    activityFeed: readActivityFeed(database),
    teamSpaces: readTeamSpaces(database),
    productInterest: readProductInterest(database),
    timelineEvents: readTimelineEvents(database)
  };
}

export function getDatabasePath() {
  return dbPath;
}
