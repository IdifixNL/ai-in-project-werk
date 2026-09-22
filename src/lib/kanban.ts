import { randomUUID } from "node:crypto";
import { desc, eq, asc, sql } from "drizzle-orm";
import { ready } from "./db";
import { tickets, comments, events } from "./schema";
import { TICKET_PREFIX } from "./config";
import {
  STATUSES, PRIORITIES, isHuman,
  type Ticket, type Comment, type TicketEvent, type Status, type Priority, type EvidenceItem, type Stats, type EventKind,
} from "./types";

export class KanbanError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

type Row = typeof tickets.$inferSelect;

function toTicket(r: Row): Ticket {
  let evidence: EvidenceItem[] = [];
  try { evidence = JSON.parse(r.evidence); } catch { evidence = []; }
  return {
    id: r.id, ref: `${TICKET_PREFIX}-${r.number}`, number: r.number, title: r.title, description: r.description,
    status: r.status as Status, priority: r.priority as Priority, label: r.label, owner: r.owner,
    plan: r.plan, outcome: r.outcome, evidence, createdBy: r.createdBy, createdAt: r.createdAt, updatedAt: r.updatedAt,
  };
}

function toEvent(r: typeof events.$inferSelect): TicketEvent {
  return {
    id: r.id, ticketId: r.ticketId, kind: r.kind as EventKind, fromStatus: r.fromStatus as Status | null,
    toStatus: r.toStatus as Status | null, actor: r.actor, note: r.note, createdAt: r.createdAt,
  };
}

function requireActor(actor: unknown): string {
  if (typeof actor !== "string" || actor.trim() === "") {
    throw new KanbanError(400, "actor is required, e.g. \"human:Nico\" or \"agent:builder\"");
  }
  return actor.trim();
}

function requireStatus(s: unknown): Status {
  if (typeof s !== "string" || !(STATUSES as readonly string[]).includes(s)) {
    throw new KanbanError(400, `status must be one of ${STATUSES.join(", ")}`);
  }
  return s as Status;
}

function requirePriority(p: unknown): Priority {
  if (typeof p !== "string" || !(PRIORITIES as readonly string[]).includes(p)) {
    throw new KanbanError(400, `priority must be one of ${PRIORITIES.join(", ")}`);
  }
  return p as Priority;
}

async function log(ticketId: string, kind: EventKind, actor: string, extra: Partial<Pick<TicketEvent, "fromStatus" | "toStatus" | "note">> = {}) {
  const db = await ready();
  await db.insert(events).values({
    id: randomUUID(), ticketId, kind, actor,
    fromStatus: extra.fromStatus ?? null, toStatus: extra.toStatus ?? null, note: extra.note ?? null,
    createdAt: new Date().toISOString(),
  });
}

export async function listTickets(): Promise<Ticket[]> {
  const db = await ready();
  const rows = await db.select().from(tickets).orderBy(asc(tickets.number));
  return rows.map(toTicket);
}

export async function getTicket(id: string): Promise<Ticket> {
  const db = await ready();
  const [row] = await db.select().from(tickets).where(eq(tickets.id, id));
  if (!row) throw new KanbanError(404, "ticket not found");
  return toTicket(row);
}

/** Accepts an id or a ref like DEMO-4. */
export async function resolveId(idOrRef: string): Promise<string> {
  const db = await ready();
  const m = idOrRef.match(/^([A-Za-z]+)-(\d+)$/);
  if (m && m[1].toUpperCase() === TICKET_PREFIX.toUpperCase()) {
    const [row] = await db.select({ id: tickets.id }).from(tickets).where(eq(tickets.number, Number(m[2])));
    if (!row) throw new KanbanError(404, "ticket not found");
    return row.id;
  }
  return idOrRef;
}

export type CreateInput = {
  title: unknown; description?: unknown; status?: unknown; priority?: unknown; label?: unknown; owner?: unknown; actor: unknown;
};

export async function createTicket(input: CreateInput): Promise<Ticket> {
  const db = await ready();
  const actor = requireActor(input.actor);
  if (typeof input.title !== "string" || input.title.trim() === "") throw new KanbanError(400, "title is required");
  const status = input.status === undefined ? "backlog" : requireStatus(input.status);
  const priority = input.priority === undefined ? "medium" : requirePriority(input.priority);
  if (status === "done" && !isHuman(actor)) throw new KanbanError(403, "only a human may create a ticket in done");

  const [{ max }] = await db.select({ max: sql<number>`coalesce(max(${tickets.number}), 0)` }).from(tickets);
  const now = new Date().toISOString();
  const id = randomUUID();
  await db.insert(tickets).values({
    id, number: max + 1, title: input.title.trim(),
    description: typeof input.description === "string" ? input.description : "",
    status, priority,
    label: typeof input.label === "string" && input.label ? input.label : null,
    owner: typeof input.owner === "string" && input.owner ? input.owner : null,
    evidence: "[]", createdBy: actor, createdAt: now, updatedAt: now,
  });
  await log(id, "created", actor, { toStatus: status });
  return getTicket(id);
}

export type PatchInput = {
  actor: unknown; status?: unknown; priority?: unknown; label?: unknown; owner?: unknown; title?: unknown;
  description?: unknown; plan?: unknown; outcome?: unknown; evidence?: unknown; appendEvidence?: unknown; note?: unknown;
};

/**
 * The one rule the server enforces: an agent can never set status to done.
 * Everything else in the lifecycle is convention, written in CLAUDE.md.
 */
export async function updateTicket(id: string, input: PatchInput): Promise<Ticket> {
  const db = await ready();
  const before = await getTicket(id);
  const actor = requireActor(input.actor);
  const note = typeof input.note === "string" ? input.note : null;
  const patch: Partial<Row> = {};

  if (input.status !== undefined) {
    const status = requireStatus(input.status);
    if (status === "done" && !isHuman(actor)) {
      await log(id, "refused", actor, { fromStatus: before.status, toStatus: "done", note: "only a human may move a ticket to done" });
      throw new KanbanError(403, "only a human may move a ticket to done. Move it to review and ask for sign-off.");
    }
    if (status !== before.status) patch.status = status;
  }
  if (input.priority !== undefined) patch.priority = requirePriority(input.priority);
  if (input.label !== undefined) patch.label = typeof input.label === "string" && input.label ? input.label : null;
  if (input.owner !== undefined) patch.owner = typeof input.owner === "string" && input.owner ? input.owner : null;
  if (typeof input.title === "string" && input.title.trim()) patch.title = input.title.trim();
  if (typeof input.description === "string") patch.description = input.description;
  if (typeof input.plan === "string") patch.plan = input.plan;
  if (typeof input.outcome === "string") patch.outcome = input.outcome;

  let evidence = before.evidence;
  if (Array.isArray(input.evidence)) evidence = input.evidence as EvidenceItem[];
  if (input.appendEvidence !== undefined) {
    const items = Array.isArray(input.appendEvidence) ? input.appendEvidence : [input.appendEvidence];
    const stamped = (items as Partial<EvidenceItem>[]).map((e) => ({
      url: typeof e.url === "string" ? e.url : undefined,
      caption: typeof e.caption === "string" ? e.caption : "",
      ts: new Date().toISOString(),
    }));
    evidence = [...evidence, ...stamped];
  }
  if (evidence !== before.evidence) patch.evidence = JSON.stringify(evidence);

  if (Object.keys(patch).length === 0) return before;
  patch.updatedAt = new Date().toISOString();
  await db.update(tickets).set(patch).where(eq(tickets.id, id));

  if (patch.status) await log(id, "status", actor, { fromStatus: before.status, toStatus: patch.status as Status, note });
  if (patch.plan !== undefined && patch.plan !== before.plan) await log(id, "plan", actor, { note: "AI plan published" });
  if ((patch.outcome !== undefined && patch.outcome !== before.outcome) || patch.evidence !== undefined) {
    await log(id, "result", actor, { note: patch.evidence !== undefined ? `${evidence.length} evidence item(s)` : "verdict written" });
  }
  return getTicket(id);
}

export async function listComments(ticketId: string): Promise<Comment[]> {
  const db = await ready();
  return db.select().from(comments).where(eq(comments.ticketId, ticketId)).orderBy(asc(comments.createdAt));
}

export async function addComment(ticketId: string, input: { author: unknown; content: unknown }): Promise<Comment> {
  const db = await ready();
  await getTicket(ticketId);
  const author = requireActor(input.author);
  if (typeof input.content !== "string" || input.content.trim() === "") throw new KanbanError(400, "content is required");
  const row = { id: randomUUID(), ticketId, author, content: input.content.trim(), createdAt: new Date().toISOString() };
  await db.insert(comments).values(row);
  await log(ticketId, "comment", author, { note: row.content.slice(0, 120) });
  return row;
}

export async function listEvents(ticketId: string): Promise<TicketEvent[]> {
  const db = await ready();
  const rows = await db.select().from(events).where(eq(events.ticketId, ticketId)).orderBy(asc(events.createdAt));
  return rows.map(toEvent);
}

/** ISO week key like 2026-W38, used to bucket throughput. */
function isoWeek(iso: string): string {
  const d = new Date(iso);
  const day = (d.getUTCDay() + 6) % 7; // Monday = 0
  d.setUTCDate(d.getUTCDate() - day + 3); // Thursday of this week decides the year
  const year = d.getUTCFullYear();
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const week = 1 + Math.round(((d.getTime() - jan4.getTime()) / 86_400_000 - 3 + ((jan4.getUTCDay() + 6) % 7)) / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

export async function getStats(): Promise<Stats> {
  const db = await ready();
  const all = (await db.select().from(tickets)).map(toTicket);
  const counts = Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<Status, number>;
  for (const t of all) counts[t.status] += 1;

  const now = Date.now();
  const inReview = all.filter((t) => t.status === "review");
  const oldest = inReview.length ? Math.min(...inReview.map((t) => new Date(t.updatedAt).getTime())) : null;

  const statusEvents = (await db.select().from(events).where(eq(events.kind, "status"))).map(toEvent);
  const doneEvents = statusEvents.filter((e) => e.toStatus === "done");
  const weekMs = 7 * 86_400_000;
  const doneThisWeek = doneEvents.filter((e) => now - new Date(e.createdAt).getTime() < weekMs).length;
  const doneLastWeek = doneEvents.filter((e) => { const age = now - new Date(e.createdAt).getTime(); return age >= weekMs && age < 2 * weekMs; }).length;
  const agentMoves = statusEvents.filter((e) => !isHuman(e.actor)).length;

  const weeks: string[] = [];
  for (let i = 7; i >= 0; i--) weeks.push(isoWeek(new Date(now - i * weekMs).toISOString()));
  const byWeek = new Map(weeks.map((w) => [w, 0]));
  for (const e of doneEvents) {
    const w = isoWeek(e.createdAt);
    if (byWeek.has(w)) byWeek.set(w, (byWeek.get(w) ?? 0) + 1);
  }

  const refById = new Map(all.map((t) => [t.id, t.ref]));
  const recentRows = await db.select().from(events).orderBy(desc(events.createdAt)).limit(8);
  const recent = recentRows.map((r) => ({ ...toEvent(r), ref: refById.get(r.ticketId) ?? "?" }));

  return {
    counts,
    open: all.length - counts.done,
    awaitingReview: counts.review,
    oldestReviewHours: oldest === null ? null : Math.round((now - oldest) / 3_600_000),
    doneThisWeek, doneLastWeek,
    agentSharePct: statusEvents.length ? Math.round((100 * agentMoves) / statusEvents.length) : null,
    throughput: weeks.map((w) => ({ week: w, done: byWeek.get(w) ?? 0 })),
    recent,
  };
}

