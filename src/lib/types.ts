export const STATUSES = ["backlog", "todo", "in_progress", "review", "done"] as const;
export type Status = (typeof STATUSES)[number];

export const PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const LABELS = ["dashboard", "agent", "api", "docs", "bug", "design"] as const;

/** Who may move a ticket INTO each column. The server enforces only the `done` row. */
export const COLUMNS: { id: Status; label: string; owner: "human" | "agent" }[] = [
  { id: "backlog", label: "Backlog", owner: "human" },
  { id: "todo", label: "Todo", owner: "human" },
  { id: "in_progress", label: "In progress", owner: "agent" },
  { id: "review", label: "Review", owner: "agent" },
  { id: "done", label: "Done", owner: "human" },
];

export type EvidenceItem = { url?: string; caption: string; ts: string };

export type Ticket = {
  id: string;
  ref: string;
  number: number;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  label: string | null;
  owner: string | null;
  plan: string | null;
  outcome: string | null;
  evidence: EvidenceItem[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type Comment = {
  id: string;
  ticketId: string;
  author: string;
  content: string;
  createdAt: string;
};

export type EventKind = "created" | "status" | "plan" | "result" | "comment" | "refused";

export type TicketEvent = {
  id: string;
  ticketId: string;
  kind: EventKind;
  fromStatus: Status | null;
  toStatus: Status | null;
  actor: string;
  note: string | null;
  createdAt: string;
};

/**
 * Actors are strings like "human:Nico" or "agent:builder".
 * Anything that does not start with "human" is treated as an agent.
 */
export function isHuman(actor: string): boolean {
  return actor.startsWith("human");
}

/** "human:Nico" -> "Nico", "agent:builder" -> "builder", "human" -> "human". */
export function actorName(actor: string): string {
  const i = actor.indexOf(":");
  return i === -1 ? actor : actor.slice(i + 1) || actor;
}

/** Owner is stored as an actor string; a bare name counts as a human. */
export function ownerActor(owner: string): string {
  return owner.includes(":") ? owner : `human:${owner}`;
}

export type Stats = {
  counts: Record<Status, number>;
  open: number;
  awaitingReview: number;
  oldestReviewHours: number | null;
  doneThisWeek: number;
  doneLastWeek: number;
  agentSharePct: number | null;
  throughput: { week: string; done: number }[];
  recent: (TicketEvent & { ref: string })[];
};
