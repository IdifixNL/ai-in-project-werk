import { randomUUID } from "node:crypto";
import type { Db } from "./db";
import { tickets, comments, events } from "./schema";
import type { Status, Priority } from "./types";

/**
 * Demo board, inserted once when the database is empty.
 * Timestamps are relative to "now" so the dashboard always shows 8 weeks of history.
 */
type SeedTicket = {
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  label: string;
  owner: string | null;
  plan?: string;
  outcome?: string;
  evidence?: { caption: string; daysAgo: number }[];
  /** status history as [status, daysAgo, actor] */
  history: [Status, number, string][];
  comments?: [string, string, number][];
};

const H = "human:Nico";
const A = "agent:builder";

const SEED: SeedTicket[] = [
  {
    title: "Starter kit runs locally with one command",
    description: "Anyone in the team should be able to clone the repo, run `npm install && npm run dev` and see the board. No accounts, no cloud.",
    status: "done", priority: "high", label: "docs", owner: "human:Nico",
    plan: "Ship SQLite in a file, seed demo data on first boot, document the two commands in the README.",
    outcome: "Verified on macOS and Windows 11. Boot takes about 4 seconds. Docker fallback documented.",
    evidence: [{ caption: "Terminal: npm run dev, board at localhost:3000", daysAgo: 49 }],
    history: [["backlog", 52, H], ["todo", 51, H], ["in_progress", 50, A], ["review", 49, A], ["done", 49, H]],
  },
  {
    title: "Agents can never move a ticket to done (server rule)",
    description: "We want the board itself to guarantee that a human signs off on every piece of work. An agent may deliver to review, but only a person may close.",
    status: "review", priority: "urgent", label: "api", owner: "agent:builder",
    plan: "Add an `actor` field to every PATCH. If the actor is not a human and the target status is `done`, refuse with 403 and log a `refused` event so the attempt is visible on the dashboard.",
    outcome: "PATCH with actor agent:* and status done returns 403. Test: 3 cases, all green. Refusal shows in the activity feed.",
    evidence: [{ caption: "curl output: 403 with explanation", daysAgo: 0 }],
    history: [["backlog", 9, H], ["todo", 8, H], ["in_progress", 1, A], ["review", 0, A]],
    comments: [[A, "Plan published. Going with a 403 rather than silently ignoring the status so the agent learns the rule.", 1]],
  },
  {
    title: "Dashboard: KPI tiles read from /api/stats",
    description: "The four numbers at the top of the dashboard should come from the database, not be hard-coded.",
    status: "review", priority: "medium", label: "dashboard", owner: "agent:builder",
    plan: "One endpoint `GET /api/stats` computes counts per column, review queue age, done this week vs last week, and the agent share from the event log.",
    outcome: "Endpoint live, page reads it server-side. Screenshot attached.",
    evidence: [{ caption: "Dashboard with live KPI tiles", daysAgo: 0 }],
    history: [["backlog", 6, H], ["todo", 5, H], ["in_progress", 1, A], ["review", 0, A]],
  },
  {
    title: "Add a throughput chart (tickets done per week) to the dashboard",
    description: "The dashboard shows counts per column but not how fast work flows. I want to see tickets moved to done per week for the last 8 weeks.",
    status: "in_progress", priority: "high", label: "dashboard", owner: "agent:builder",
    plan: "Restating: weekly buckets of tickets that reached done, last 8 weeks.\n\n1. Extend GET /api/stats with `throughput: [{week, done}]` from events where to_status = 'done'.\n2. Add a ThroughputChart component (plain SVG, no chart library).\n3. Test: seed 3 done events across 2 weeks, assert 2 buckets.\n\nOut of scope: per-person throughput, cycle time. Evidence: screenshot of the chart with seeded data plus test output.",
    history: [["backlog", 4, H], ["todo", 3, H], ["in_progress", 0, A]],
    comments: [[H, "Weekly buckets are enough, no need for daily.", 0], [A, "Plan published. Starting on the API change first so the chart has real data to render.", 0]],
  },
  {
    title: "Tester agent: verify every ticket has evidence before review",
    description: "Before a ticket lands in review, someone should check that the Result tab has a real verdict and at least one piece of evidence. Make that an agent's job.",
    status: "todo", priority: "high", label: "agent", owner: null,
    history: [["backlog", 3, H], ["todo", 2, H]],
  },
  {
    title: "Write the CLAUDE.md board contract for our team",
    description: "Our agents need to know the ticket lifecycle, the field names and the one hard rule. Put it in CLAUDE.md so every session reads it.",
    status: "todo", priority: "medium", label: "docs", owner: null,
    history: [["backlog", 3, H], ["todo", 2, H]],
  },
  {
    title: "Show revenue per client on the dashboard",
    description: "For the finance track: a small table with the top 5 clients by revenue this quarter. Data can be a CSV in the repo for now.",
    status: "backlog", priority: "medium", label: "dashboard", owner: null,
    history: [["backlog", 2, H]],
  },
  {
    title: "Add a blocked flag to tickets with a reason",
    description: "Sometimes a ticket cannot move because we wait on someone else. It should be visible on the card why it is stuck.",
    status: "backlog", priority: "low", label: "api", owner: null,
    history: [["backlog", 1, H]],
  },
  {
    title: "Export the board to CSV for the weekly report",
    description: "A button on the dashboard that downloads all tickets with status, owner and last update, for the Monday report.",
    status: "backlog", priority: "low", label: "dashboard", owner: null,
    history: [["backlog", 0, H]],
  },
];

// Older tickets that only exist to give the throughput chart a history.
const HISTORY_ONLY: { title: string; label: string; daysAgo: number }[] = [
  { title: "Choose the stack for the starter kit", label: "docs", daysAgo: 55 },
  { title: "Set up the repository and CI", label: "api", daysAgo: 47 },
  { title: "Sketch the board layout", label: "design", daysAgo: 44 },
  { title: "Ticket model with request, plan and result", label: "api", daysAgo: 40 },
  { title: "Drag and drop between columns", label: "dashboard", daysAgo: 34 },
  { title: "Comments on a ticket", label: "api", daysAgo: 33 },
  { title: "Seed data for the demo", label: "docs", daysAgo: 27 },
  { title: "Journey log per ticket", label: "api", daysAgo: 20 },
  { title: "Filter the board by priority and label", label: "dashboard", daysAgo: 19 },
  { title: "Light and dark theme", label: "design", daysAgo: 13 },
  { title: "Docker compose fallback", label: "docs", daysAgo: 12 },
  { title: "Workshop exercises written", label: "docs", daysAgo: 6 },
];

function at(daysAgo: number, hourOffset = 0): string {
  const d = new Date(Date.now() - daysAgo * 86_400_000 - hourOffset * 3_600_000);
  return d.toISOString();
}

export async function seed(db: Db): Promise<void> {
  let number = 0;

  for (const h of HISTORY_ONLY) {
    number += 1;
    const id = randomUUID();
    await db.insert(tickets).values({
      id, number, title: h.title, description: "Seeded history so the dashboard has something to show.",
      status: "done", priority: "medium", label: h.label, owner: "agent:builder",
      plan: "Seeded.", outcome: "Seeded as done.", evidence: "[]",
      createdBy: H, createdAt: at(h.daysAgo + 3), updatedAt: at(h.daysAgo),
    });
    await db.insert(events).values([
      { id: randomUUID(), ticketId: id, kind: "created", fromStatus: null, toStatus: "backlog", actor: H, note: null, createdAt: at(h.daysAgo + 3) },
      { id: randomUUID(), ticketId: id, kind: "status", fromStatus: "backlog", toStatus: "in_progress", actor: A, note: null, createdAt: at(h.daysAgo + 2) },
      { id: randomUUID(), ticketId: id, kind: "status", fromStatus: "in_progress", toStatus: "review", actor: A, note: null, createdAt: at(h.daysAgo + 1) },
      { id: randomUUID(), ticketId: id, kind: "status", fromStatus: "review", toStatus: "done", actor: H, note: null, createdAt: at(h.daysAgo) },
    ]);
  }

  for (const t of SEED) {
    number += 1;
    const id = randomUUID();
    const first = t.history[0];
    const last = t.history[t.history.length - 1];
    const evidence = (t.evidence ?? []).map((e) => ({ caption: e.caption, ts: at(e.daysAgo) }));
    await db.insert(tickets).values({
      id, number, title: t.title, description: t.description, status: t.status, priority: t.priority,
      label: t.label, owner: t.owner, plan: t.plan ?? null, outcome: t.outcome ?? null,
      evidence: JSON.stringify(evidence), createdBy: H, createdAt: at(first[1], 2), updatedAt: at(last[1]),
    });
    let prev: Status | null = null;
    for (const [status, daysAgo, actor] of t.history) {
      await db.insert(events).values({
        id: randomUUID(), ticketId: id, kind: prev === null ? "created" : "status",
        fromStatus: prev, toStatus: status, actor, note: null, createdAt: at(daysAgo, prev === null ? 2 : 1),
      });
      prev = status;
    }
    if (t.plan) {
      await db.insert(events).values({ id: randomUUID(), ticketId: id, kind: "plan", fromStatus: null, toStatus: null, actor: A, note: "AI plan published", createdAt: at(last[1], 0.9) });
    }
    for (const [author, content, daysAgo] of t.comments ?? []) {
      await db.insert(comments).values({ id: randomUUID(), ticketId: id, author, content, createdAt: at(daysAgo, 0.5) });
    }
    if (t.status === "review" && t.title.startsWith("Agents can never")) {
      // The demo refusal: the builder tried to close its own ticket.
      await db.insert(events).values({ id: randomUUID(), ticketId: id, kind: "refused", fromStatus: "review", toStatus: "done", actor: A, note: "only a human may move a ticket to done", createdAt: at(0, 0.3) });
    }
  }
}
