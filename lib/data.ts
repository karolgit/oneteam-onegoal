export type Account = {
  id: string;
  name: string;
  industry: string;
  website: string;
  revenue: string;
  employeeCount: string;
  headquarters: string;
  owner: string;
  tier: "Tier 1" | "Tier 2" | "Tier 3";
  summary: string;
  strategicInitiatives: string[];
  currentProducts: string[];
  openOpportunities: string[];
  notes: string;
  techStack: string[];
  recentNews: string[];
  industryTrends: string[];
  oracleOpportunities: string[];
  engagementScore: number;
  meetingsCount: number;
  actionItemsOpen: number;
};

export type Meeting = {
  id: string;
  title: string;
  date: string;
  accountId: string;
  attendees: string[];
  internalTeam: string[];
  type: string;
  summary: string;
  topics: string[];
  decisions: string[];
  actionItems: string[];
  risks: string[];
  opportunities: string[];
  nextSteps: string[];
  owner: string;
};

export type Transcript = {
  id: string;
  accountId: string;
  title: string;
  source: "Zoom TXT" | "PDF" | "DOCX" | "Rep Notes";
  uploadedAt: string;
  extracted: {
    summary: string;
    actionItems: string[];
    decisions: string[];
    topics: string[];
  };
};

export type ActivityItem = string;

export type TeamSpace = {
  name: string;
  tags: string[];
  update: string;
};

export type ProductInterest = {
  product: string;
  value: number;
};

export type TimelineEvent = {
  date: string;
  title: string;
  detail: string;
};

export type AppData = {
  accounts: Account[];
  meetings: Meeting[];
  transcripts: Transcript[];
  activityFeed: ActivityItem[];
  teamSpaces: TeamSpace[];
  productInterest: ProductInterest[];
  timelineEvents: TimelineEvent[];
};

const companyNames = [
  "Microsoft",
  "Amazon",
  "Google",
  "Netflix",
  "Tesla",
  "Adobe",
  "Nvidia",
  "Cisco",
  "Intel",
  "Salesforce",
  "Uber",
  "Airbnb",
  "Apple",
  "Meta",
  "Oracle",
  "IBM",
  "Dell",
  "HP",
  "ServiceNow",
  "Snowflake",
  "Databricks",
  "Stripe",
  "Shopify",
  "PayPal",
  "Block",
  "Zoom",
  "Atlassian",
  "Workday",
  "SAP",
  "Siemens",
  "GE",
  "Boeing",
  "Lockheed Martin",
  "Northrop Grumman",
  "Raytheon",
  "Walmart",
  "Target",
  "Costco",
  "Home Depot",
  "Lowe's",
  "McDonald's",
  "Starbucks",
  "Coca-Cola",
  "PepsiCo",
  "Nike",
  "Disney",
  "Comcast",
  "Verizon",
  "AT&T",
  "T-Mobile",
  "Ford",
  "GM",
  "Toyota",
  "Honda",
  "Rivian",
  "Lucid Motors",
  "FedEx",
  "UPS",
  "DHL",
  "United Airlines",
  "Delta Air Lines",
  "American Airlines",
  "Marriott",
  "Hilton",
  "Booking Holdings",
  "Expedia",
  "Pfizer",
  "Johnson & Johnson",
  "Moderna",
  "Merck",
  "UnitedHealth Group",
  "CVS Health",
  "Cigna",
  "JPMorgan Chase",
  "Bank of America",
  "Wells Fargo",
  "Goldman Sachs",
  "Morgan Stanley",
  "Visa",
  "Mastercard",
  "American Express",
  "Coinbase",
  "Spotify",
  "Snap",
  "Pinterest",
  "Reddit",
  "Dropbox",
  "Box",
  "Okta",
  "CrowdStrike",
  "Palo Alto Networks",
  "Zscaler",
  "Cloudflare",
  "Twilio",
  "DocuSign",
  "HubSpot",
  "Intuit",
  "Autodesk",
  "Figma",
  "Canva"
];

const industries = [
  "Cloud Software",
  "Retail and Marketplace",
  "Digital Media",
  "Automotive",
  "Creative Software",
  "Semiconductors",
  "Networking",
  "Enterprise SaaS",
  "Travel",
  "Financial Services",
  "Healthcare",
  "Telecommunications",
  "Manufacturing",
  "Consumer Goods"
];

const headquarters = [
  "Redmond, WA",
  "Seattle, WA",
  "Mountain View, CA",
  "Los Gatos, CA",
  "Austin, TX",
  "San Jose, CA",
  "Santa Clara, CA",
  "San Francisco, CA",
  "New York, NY",
  "Chicago, IL",
  "Dallas, TX",
  "Boston, MA"
];

const owners = [
  "Maya Chen",
  "Evan Brooks",
  "Priya Nair",
  "Jordan Ellis",
  "Nora Walsh",
  "Andre Wilson",
  "Leah Ortiz",
  "Samir Patel"
];

const productCatalog = [
  "Oracle Database",
  "OCI",
  "Autonomous Database",
  "Exadata",
  "Oracle Analytics",
  "Oracle Cloud ERP",
  "Oracle Fusion HCM",
  "NetSuite",
  "MySQL HeatWave",
  "Oracle AI Vector Search"
];

const tech = [
  "Kubernetes",
  "Snowflake",
  "Kafka",
  "Tableau",
  "AWS",
  "Azure",
  "GCP",
  "Databricks",
  "Okta",
  "Terraform",
  "React",
  "Java",
  "Python",
  "PostgreSQL"
];

const initiatives = [
  "AI-assisted customer operations",
  "Data platform consolidation",
  "Database modernization",
  "Cloud cost optimization",
  "Security posture uplift",
  "Application portfolio rationalization",
  "Executive reporting automation",
  "Global expansion readiness"
];

const trends = [
  "AI governance is moving from pilot teams into enterprise controls.",
  "Finance leaders are asking for clearer cloud unit economics.",
  "Data teams are standardizing operational and analytical stores.",
  "Security teams want identity-aware controls across SaaS and cloud estates.",
  "Executives are prioritizing vendor consolidation and measurable time to value."
];

const opportunityTemplates = [
  "OCI migration assessment for high-volume workloads",
  "Autonomous Database proof of concept for analytics teams",
  "MySQL HeatWave benchmark against current reporting stack",
  "Oracle Analytics executive dashboard workshop",
  "AI Vector Search pilot for knowledge retrieval",
  "Fusion Cloud alignment for finance and HR modernization"
];

function domainFor(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "")
    .concat(".com");
}

function pickMany<T>(list: T[], start: number, count: number) {
  return Array.from({ length: count }, (_, index) => list[(start + index) % list.length]);
}

export const accounts: Account[] = companyNames.map((name, index) => {
  const initiativeOffset = index % initiatives.length;
  const tier = index % 5 === 0 ? "Tier 1" : index % 3 === 0 ? "Tier 2" : "Tier 3";
  const revenueBand = 8 + ((index * 13) % 210);
  const employees = 4_000 + ((index * 8_750) % 225_000);

  return {
    id: `acct-${index + 1}`,
    name,
    industry: industries[index % industries.length],
    website: `https://${domainFor(name)}`,
    revenue: `$${revenueBand}B`,
    employeeCount: employees.toLocaleString("en-US"),
    headquarters: headquarters[index % headquarters.length],
    owner: owners[index % owners.length],
    tier,
    summary: `${name} is a ${industries[index % industries.length].toLowerCase()} leader focused on resilient digital operations, data-driven decision making, and measurable platform efficiency.`,
    strategicInitiatives: pickMany(initiatives, initiativeOffset, 3),
    currentProducts: pickMany(productCatalog, index, 3),
    openOpportunities: pickMany(opportunityTemplates, index, 2),
    notes: `Strong executive interest in shared customer context, faster operating reviews, and a clearer path from experimentation to production AI.`,
    techStack: pickMany(tech, index, 5),
    recentNews: [
      `${name} announced new investments in automation and AI-enabled workflow improvements.`,
      `${name} expanded leadership focus on operational efficiency and customer experience.`,
      `${name} is evaluating platform consolidation opportunities across data and cloud teams.`
    ],
    industryTrends: pickMany(trends, index, 3),
    oracleOpportunities: pickMany(opportunityTemplates, index + 2, 3),
    engagementScore: 61 + ((index * 7) % 38),
    meetingsCount: 4 + ((index * 3) % 18),
    actionItemsOpen: 1 + (index % 6)
  };
});

const curatedMeetings: Meeting[] = [
  {
    id: "mtg-h1",
    title: "January Relationship Recap",
    date: "2026-01-15",
    accountId: "acct-1",
    attendees: ["Avery Stone", "Mina Park"],
    internalTeam: ["Sales", "Services Team"],
    type: "Account Review",
    summary:
      "The account team reviewed 2025 relationship history, open executive asks, and customer priorities for AI governance and cloud consolidation.",
    topics: ["relationship history", "executive priorities", "cloud consolidation"],
    decisions: ["Maintain CIO sponsorship map", "Create shared action tracker"],
    actionItems: ["Send Q1 stakeholder map", "Document open procurement questions"],
    risks: ["Multiple teams were tracking customer context in separate notes"],
    opportunities: ["OCI consumption planning", "AI knowledge retrieval"],
    nextSteps: ["Schedule AI roadmap discovery", "Align account team owners"],
    owner: "Maya Chen"
  },
  {
    id: "mtg-h2",
    title: "OCI Baseline Discovery",
    date: "2026-02-12",
    accountId: "acct-2",
    attendees: ["Morgan Lee", "Rachel Kim", "Noah Foster"],
    internalTeam: ["OCI Team", "Sales"],
    type: "Discovery",
    summary:
      "Infrastructure and finance stakeholders outlined workload cost drivers, migration constraints, and success metrics for a potential OCI business case.",
    topics: ["workload inventory", "cloud economics", "migration sequencing"],
    decisions: ["Focus first model on analytics workloads", "Use finance-approved cost categories"],
    actionItems: ["Collect top workload spend", "Share OCI pricing assumptions"],
    risks: ["Dependency inventory is incomplete across older systems"],
    opportunities: ["OCI Compute", "Oracle Support Rewards"],
    nextSteps: ["Review baseline model with finance"],
    owner: "Evan Brooks"
  },
  {
    id: "mtg-h3",
    title: "Database Workload Notes",
    date: "2026-03-05",
    accountId: "acct-7",
    attendees: ["Chris Nolan", "Priya Shah"],
    internalTeam: ["Database Team", "Data Platform Team"],
    type: "Technical Notes",
    summary:
      "Database stakeholders captured reporting latency, nightly ETL pressure, and workload isolation issues that should inform a modernization brief.",
    topics: ["database latency", "ETL windows", "workload isolation"],
    decisions: ["Shortlist two workloads for benchmark planning"],
    actionItems: ["Collect query profile samples", "Confirm current database versions"],
    risks: ["Change windows may limit benchmark timing"],
    opportunities: ["Autonomous Database", "Exadata"],
    nextSteps: ["Prepare modernization review"],
    owner: "Priya Nair"
  },
  {
    id: "mtg-h4",
    title: "Data Governance Roundtable",
    date: "2026-04-16",
    accountId: "acct-20",
    attendees: ["Iris Wang", "Kai Nguyen", "Elena Morris"],
    internalTeam: ["Data Platform Team", "AI Team", "Security Team"],
    type: "Roundtable",
    summary:
      "Data, AI, and security stakeholders discussed lineage, access tiers, and policy requirements for using enterprise knowledge in AI workflows.",
    topics: ["lineage", "access policy", "AI retrieval readiness"],
    decisions: ["Start governance map with customer support knowledge"],
    actionItems: ["List approved data domains", "Identify sensitive fields"],
    risks: ["Legacy reports have unclear ownership"],
    opportunities: ["Oracle Analytics", "AI Vector Search"],
    nextSteps: ["Define pilot knowledge boundaries"],
    owner: "Leah Ortiz"
  },
  {
    id: "mtg-h5",
    title: "Retail Scale Planning Notes",
    date: "2026-05-20",
    accountId: "acct-36",
    attendees: ["Harper Diaz", "Owen Price", "Dana Brooks"],
    internalTeam: ["Services Team", "OCI Team"],
    type: "Planning Notes",
    summary:
      "Operations leaders captured seasonal scale concerns, integration dependencies, and readiness checkpoints before the next executive steering meeting.",
    topics: ["seasonal scale", "integration readiness", "training"],
    decisions: ["Escalate partner dependency risk", "Keep training as a tracked workstream"],
    actionItems: ["Update migration tracker", "Confirm service owner list"],
    risks: ["Partner timeline could affect launch readiness"],
    opportunities: ["OCI scalability", "Managed services expansion"],
    nextSteps: ["Prepare executive status readout"],
    owner: "Jordan Ellis"
  },
  {
    id: "mtg-h6",
    title: "Security Controls Notes",
    date: "2026-06-10",
    accountId: "acct-90",
    attendees: ["Dana Brooks", "Elena Morris", "Tariq Khan"],
    internalTeam: ["Security Team", "Services Team"],
    type: "Historical Notes",
    summary:
      "The team documented audit control gaps, identity concerns, and stakeholder expectations ahead of the next security follow-up.",
    topics: ["audit controls", "identity risk", "hybrid cloud"],
    decisions: ["Invite compliance director to the next session"],
    actionItems: ["Map OCI controls to internal framework", "Confirm audit evidence requirements"],
    risks: ["Competing security tooling evaluation"],
    opportunities: ["OCI Security Zones", "Cloud Guard"],
    nextSteps: ["Prepare controls mapping session"],
    owner: "Andre Wilson"
  },
  {
    id: "mtg-1",
    title: "Executive Alignment and AI Roadmap",
    date: "2026-06-18",
    accountId: "acct-1",
    attendees: ["Avery Stone", "Mina Park", "Luis Romero"],
    internalTeam: ["Sales", "AI Team", "OCI Team"],
    type: "Executive Briefing",
    summary:
      "Leadership aligned on a two-quarter plan to move generative AI pilots into governed production workflows.",
    topics: ["AI governance", "OCI migration path", "executive scorecards"],
    decisions: ["Prioritize AI Vector Search discovery", "Schedule architecture workshop"],
    actionItems: ["Send reference architecture", "Confirm data residency requirements"],
    risks: ["Procurement needs clear business case by end of quarter"],
    opportunities: ["OCI AI services", "Autonomous Database"],
    nextSteps: ["Run value workshop", "Map stakeholder owners"],
    owner: "Maya Chen"
  },
  {
    id: "mtg-2",
    title: "Database Modernization Review",
    date: "2026-06-21",
    accountId: "acct-7",
    attendees: ["Chris Nolan", "Priya Shah"],
    internalTeam: ["Database Team", "Data Platform Team"],
    type: "Technical Review",
    summary:
      "Data leaders reviewed latency, workload isolation, and reporting constraints across transactional systems.",
    topics: ["Exadata", "Autonomous Database", "reporting latency"],
    decisions: ["Benchmark two critical workloads"],
    actionItems: ["Collect current query profiles", "Draft POC success criteria"],
    risks: ["Change window constraints"],
    opportunities: ["Autonomous Database", "Exadata Cloud@Customer"],
    nextSteps: ["Schedule benchmark readout"],
    owner: "Priya Nair"
  },
  {
    id: "mtg-3",
    title: "Security and Identity Follow-Up",
    date: "2026-06-24",
    accountId: "acct-90",
    attendees: ["Dana Brooks", "Elena Morris", "Tariq Khan"],
    internalTeam: ["Security Team", "Services Team"],
    type: "Working Session",
    summary:
      "Security stakeholders requested a unified view of identity risks, privileged access, and audit events.",
    topics: ["identity controls", "audit readiness", "cloud guardrails"],
    decisions: ["Share security reference implementation"],
    actionItems: ["Document integration prerequisites", "Identify executive sponsor"],
    risks: ["Competing security tooling evaluation"],
    opportunities: ["OCI Security Zones", "Cloud Guard"],
    nextSteps: ["Host controls mapping session"],
    owner: "Andre Wilson"
  },
  {
    id: "mtg-4",
    title: "Q3 Cloud Cost Optimization",
    date: "2026-07-01",
    accountId: "acct-2",
    attendees: ["Morgan Lee", "Rachel Kim"],
    internalTeam: ["OCI Team", "Sales"],
    type: "Planning",
    summary:
      "Finance and infrastructure teams compared spend trends and identified candidate workloads for migration modeling.",
    topics: ["cloud economics", "reserved capacity", "migration waves"],
    decisions: ["Model three workload groups"],
    actionItems: ["Prepare business case", "Share migration calculator"],
    risks: ["Incomplete dependency inventory"],
    opportunities: ["OCI Compute", "Oracle Support Rewards"],
    nextSteps: ["Deliver finance-ready summary"],
    owner: "Evan Brooks"
  },
  {
    id: "mtg-5",
    title: "Data Platform Governance Workshop",
    date: "2026-07-08",
    accountId: "acct-20",
    attendees: ["Iris Wang", "Noah Foster", "Kai Nguyen"],
    internalTeam: ["Data Platform Team", "AI Team"],
    type: "Workshop",
    summary:
      "Teams aligned on metadata, lineage, and policy requirements for enterprise analytics and AI retrieval.",
    topics: ["data catalog", "RAG readiness", "governance"],
    decisions: ["Start with customer support knowledge domain"],
    actionItems: ["Create source inventory", "Define access tiers"],
    risks: ["Unclear ownership for legacy reports"],
    opportunities: ["Oracle Analytics", "AI Vector Search"],
    nextSteps: ["Build phased adoption map"],
    owner: "Leah Ortiz"
  },
  {
    id: "mtg-6",
    title: "Services Delivery Check-In",
    date: "2026-07-10",
    accountId: "acct-36",
    attendees: ["Harper Diaz", "Owen Price"],
    internalTeam: ["Services Team", "Sales"],
    type: "Status",
    summary:
      "Implementation teams reviewed milestone health, open questions, and readiness for executive steering committee.",
    topics: ["implementation status", "risk burndown", "training"],
    decisions: ["Escalate integrations risk to steering committee"],
    actionItems: ["Update migration tracker", "Confirm training dates"],
    risks: ["Integration dependency on partner timeline"],
    opportunities: ["Managed services expansion"],
    nextSteps: ["Prepare executive status readout"],
    owner: "Jordan Ellis"
  },
  {
    id: "mtg-f1",
    title: "Executive Renewal Strategy",
    date: "2026-08-12",
    accountId: "acct-13",
    attendees: ["Taylor Green", "Morgan Patel", "CIO Office"],
    internalTeam: ["Sales", "Services Team"],
    type: "Executive Planning",
    summary:
      "Upcoming renewal strategy meeting that should be prepared with account history, open actions, and stakeholder priorities.",
    topics: ["renewal strategy", "executive outcomes", "commercial risks"],
    decisions: ["To be captured after the meeting"],
    actionItems: ["Generate AI Gist before customer conversation"],
    risks: ["Needs current view of cross-team commitments"],
    opportunities: ["Cloud expansion", "customer success services"],
    nextSteps: ["Use AI Gist to align account team"],
    owner: "Nora Walsh"
  },
  {
    id: "mtg-f2",
    title: "AI Knowledge Pilot Planning",
    date: "2026-09-17",
    accountId: "acct-21",
    attendees: ["VP Data Platform", "AI Program Lead", "Security Reviewer"],
    internalTeam: ["AI Team", "Data Platform Team"],
    type: "Pilot Planning",
    summary:
      "Future planning session for a governed AI knowledge pilot using prior workshops, transcript history, and data policy context.",
    topics: ["RAG pilot", "embeddings", "knowledge governance"],
    decisions: ["To be captured after the meeting"],
    actionItems: ["Generate AI Gist before customer conversation"],
    risks: ["Pilot scope could expand without agreed data boundaries"],
    opportunities: ["AI Vector Search", "Autonomous Database"],
    nextSteps: ["Use AI Gist to prepare pilot scope"],
    owner: "Leah Ortiz"
  },
  {
    id: "mtg-f3",
    title: "Security Readiness Review",
    date: "2026-10-08",
    accountId: "acct-91",
    attendees: ["CISO", "Compliance Director", "Platform Security Lead"],
    internalTeam: ["Security Team", "OCI Team"],
    type: "Readiness Review",
    summary:
      "Future security readiness review that needs a concise brief of prior controls discussions, open risks, and recommended Oracle security options.",
    topics: ["controls mapping", "audit evidence", "security posture"],
    decisions: ["To be captured after the meeting"],
    actionItems: ["Generate AI Gist before customer conversation"],
    risks: ["Customer may compare against existing security tooling"],
    opportunities: ["Cloud Guard", "Security Zones"],
    nextSteps: ["Use AI Gist to align security talking points"],
    owner: "Andre Wilson"
  },
  {
    id: "mtg-f4",
    title: "Holiday Scale Architecture",
    date: "2026-11-19",
    accountId: "acct-36",
    attendees: ["VP Infrastructure", "Operations Lead", "Finance Partner"],
    internalTeam: ["OCI Team", "Services Team"],
    type: "Architecture Planning",
    summary:
      "Future architecture planning conversation focused on seasonal scale, resiliency, and migration economics.",
    topics: ["holiday readiness", "resiliency", "OCI economics"],
    decisions: ["To be captured after the meeting"],
    actionItems: ["Generate AI Gist before customer conversation"],
    risks: ["Timeline pressure before seasonal traffic peak"],
    opportunities: ["OCI Compute", "managed services"],
    nextSteps: ["Use AI Gist to prepare executive-ready plan"],
    owner: "Jordan Ellis"
  },
  {
    id: "mtg-f5",
    title: "2027 Success Planning",
    date: "2026-12-03",
    accountId: "acct-1",
    attendees: ["CIO", "VP Data Platform", "Procurement Lead"],
    internalTeam: ["Sales", "AI Team", "Database Team"],
    type: "Success Planning",
    summary:
      "Future annual planning meeting that should use historical notes, open opportunities, and public account context to shape the 2027 roadmap.",
    topics: ["2027 roadmap", "success metrics", "expansion planning"],
    decisions: ["To be captured after the meeting"],
    actionItems: ["Generate AI Gist before customer conversation"],
    risks: ["Needs tight alignment across product and services teams"],
    opportunities: ["OCI", "Autonomous Database", "AI Vector Search"],
    nextSteps: ["Use AI Gist to prepare cross-team agenda"],
    owner: "Maya Chen"
  }
];

const syntheticMeetingTitles = [
  "Executive Alignment",
  "Cloud Economics Review",
  "Database Modernization",
  "AI Knowledge Workshop",
  "Security Controls Review",
  "Services Delivery Sync",
  "Data Platform Governance",
  "Renewal Planning",
  "Architecture Review",
  "Opportunity Qualification",
  "Stakeholder Check-In",
  "Success Planning"
];

const syntheticMeetingTypes = [
  "Executive Briefing",
  "Technical Review",
  "Planning",
  "Workshop",
  "Discovery",
  "Status"
];

const syntheticTeams = [
  ["Sales", "OCI Team"],
  ["Database Team", "Data Platform Team"],
  ["AI Team", "Data Platform Team"],
  ["Security Team", "Services Team"],
  ["Services Team", "Sales"],
  ["OCI Team", "Database Team"]
];

const syntheticTopics = [
  ["cloud economics", "migration waves", "business case"],
  ["Autonomous Database", "Exadata", "reporting latency"],
  ["RAG readiness", "embeddings", "knowledge governance"],
  ["audit controls", "identity risk", "security posture"],
  ["implementation status", "training", "risk burndown"],
  ["lineage", "data catalog", "analytics modernization"]
];

const syntheticOpportunities = [
  ["OCI", "Oracle Support Rewards"],
  ["Autonomous Database", "Exadata"],
  ["AI Vector Search", "OCI Generative AI"],
  ["Cloud Guard", "Security Zones"],
  ["Managed services expansion", "customer success services"],
  ["Oracle Analytics", "Data platform modernization"]
];

function getTodayKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function generateSyntheticMeetings(): Meeting[] {
  const meetingsPerMonth = 12;
  const dayPattern = [3, 5, 7, 10, 13, 16, 18, 21, 24, 26, 28, 30];
  const todayKey = getTodayKey();

  return Array.from({ length: 12 }).flatMap((_, monthIndex) =>
    Array.from({ length: meetingsPerMonth }).map((__, meetingIndex) => {
      const accountIndex = (monthIndex * meetingsPerMonth + meetingIndex * 7) % accounts.length;
      const account = accounts[accountIndex];
      const date = `2026-${String(monthIndex + 1).padStart(2, "0")}-${String(dayPattern[meetingIndex]).padStart(2, "0")}`;
      const isFutureMeeting = date > todayKey;
      const themeIndex = (monthIndex + meetingIndex) % syntheticTopics.length;
      const title = `${account.name} ${syntheticMeetingTitles[(monthIndex + meetingIndex) % syntheticMeetingTitles.length]}`;
      const internalTeam = syntheticTeams[themeIndex];
      const topics = syntheticTopics[themeIndex];
      const opportunities = syntheticOpportunities[themeIndex];

      return {
        id: `mtg-synth-${String(monthIndex + 1).padStart(2, "0")}-${String(meetingIndex + 1).padStart(2, "0")}`,
        title,
        date,
        accountId: account.id,
        attendees: [
          `${account.name} business sponsor`,
          `${account.name} platform owner`,
          `${account.name} procurement lead`
        ],
        internalTeam,
        type: syntheticMeetingTypes[(monthIndex + meetingIndex) % syntheticMeetingTypes.length],
        summary: isFutureMeeting
          ? `Future ${account.name} conversation focused on ${topics.join(", ")}. The account team should generate an AI Gist before the meeting to align history, open actions, risks, and recommended Oracle solutions.`
          : `${account.name} stakeholders discussed ${topics.join(", ")}. Notes captured decisions, risks, opportunity signals, and next-step owners for future account-team prep.`,
        topics,
        decisions: isFutureMeeting
          ? ["To be captured after the meeting", "Use AI Gist to align the account team before the customer conversation"]
          : ["Captured stakeholder priorities", "Confirmed next-step owner for follow-up"],
        actionItems: isFutureMeeting
          ? ["Generate AI Gist before customer conversation", "Review historical notes and open risks"]
          : ["Send recap to account team", "Update shared action tracker"],
        risks: isFutureMeeting
          ? ["Customer context may be fragmented without AI Gist prep"]
          : ["Open actions need cross-team ownership"],
        opportunities,
        nextSteps: isFutureMeeting
          ? ["Generate AI Gist", "Prepare recommended talking points"]
          : ["Store notes in customer memory", "Link action items to account record"],
        owner: owners[(monthIndex + meetingIndex) % owners.length]
      };
    })
  );
}

export const meetings: Meeting[] = [...curatedMeetings, ...generateSyntheticMeetings()];

export const transcripts: Transcript[] = [
  {
    id: "trn-1",
    accountId: "acct-1",
    title: "Zoom Export - AI Roadmap Discovery",
    source: "Zoom TXT",
    uploadedAt: "2026-06-08",
    extracted: {
      summary: "Stakeholders want a governed AI knowledge layer that can cite historical account context.",
      actionItems: ["Share RAG reference architecture", "Identify pilot data sources"],
      decisions: ["Use customer success domain for pilot"],
      topics: ["embeddings", "governance", "retrieval quality"]
    }
  },
  {
    id: "trn-2",
    accountId: "acct-7",
    title: "Database Benchmark Notes",
    source: "PDF",
    uploadedAt: "2026-06-04",
    extracted: {
      summary: "Current reporting workload is constrained by nightly ETL windows and mixed query patterns.",
      actionItems: ["Send benchmark template", "Gather workload statistics"],
      decisions: ["Benchmark Autonomous Database first"],
      topics: ["latency", "workload isolation", "analytics"]
    }
  },
  {
    id: "trn-3",
    accountId: "acct-90",
    title: "Security Controls Email Summary",
    source: "Rep Notes",
    uploadedAt: "2026-05-29",
    extracted: {
      summary: "Security stakeholders need stronger evidence for audit controls across hybrid cloud systems.",
      actionItems: ["Map OCI controls to internal framework"],
      decisions: ["Invite compliance director to next session"],
      topics: ["audit", "identity", "controls"]
    }
  },
  {
    id: "trn-4",
    accountId: "acct-2",
    title: "Cloud Economics Working Session",
    source: "DOCX",
    uploadedAt: "2026-05-22",
    extracted: {
      summary: "Finance requires clearer migration economics before committing to a broad workload move.",
      actionItems: ["Create finance summary", "Estimate support rewards impact"],
      decisions: ["Start with three candidate workload groups"],
      topics: ["TCO", "migration", "capacity"]
    }
  }
];

export const activityFeed = [
  "AI brief generated for Microsoft executive alignment",
  "Zoom transcript uploaded for Nvidia database benchmark",
  "Open action item tagged to Security Team",
  "Data Platform Team commented on Snowflake governance workshop",
  "OCI Team added migration notes for Amazon",
  "Services Team completed stakeholder map update"
];

export const teamSpaces = [
  {
    name: "Data Platform Team",
    tags: ["lineage", "catalog", "RAG readiness"],
    update: "Added governance notes to Snowflake and Databricks accounts."
  },
  {
    name: "Database Team",
    tags: ["Autonomous DB", "Exadata", "migration"],
    update: "Published benchmark checklist for modernization opportunities."
  },
  {
    name: "OCI Team",
    tags: ["cloud economics", "compute", "security zones"],
    update: "Shared workload migration model for strategic accounts."
  },
  {
    name: "AI Team",
    tags: ["embeddings", "briefs", "retrieval quality"],
    update: "Improved prompt template for executive-ready meeting briefs."
  },
  {
    name: "Security Team",
    tags: ["identity", "audit", "controls"],
    update: "Mapped recurring audit risks across open enterprise deals."
  },
  {
    name: "Services Team",
    tags: ["delivery", "training", "adoption"],
    update: "Created cross-account rollout readiness checklist."
  }
];

export const productInterest = [
  { product: "OCI", value: 92 },
  { product: "Autonomous DB", value: 84 },
  { product: "Oracle Analytics", value: 71 },
  { product: "AI Vector Search", value: 67 },
  { product: "Exadata", value: 58 },
  { product: "Cloud ERP", value: 49 }
];

export const timelineEvents = [
  { date: "Jan 2025", title: "Intro Meeting", detail: "Initial account discovery and stakeholder mapping." },
  { date: "Feb 2025", title: "OCI Discussion", detail: "Infrastructure team explored migration economics." },
  { date: "Apr 2025", title: "Database Modernization Review", detail: "Database team identified reporting bottlenecks." },
  { date: "Jul 2025", title: "Executive Alignment", detail: "Sponsors aligned on cloud and data platform outcomes." },
  { date: "Sep 2025", title: "Pricing Discussion", detail: "Procurement requested phased value model." },
  { date: "Nov 2025", title: "Contract Renewal", detail: "Renewal team captured risks and expansion signals." },
  { date: "Jun 2026", title: "AI Roadmap Discovery", detail: "AI team scoped knowledge retrieval pilot." }
];
