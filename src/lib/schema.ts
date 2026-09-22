import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

/**
 * Drizzle schema. The matching CREATE TABLE statements live in db.ts and run
 * on boot, so there is no migration step in the workshop. When you add a
 * column, add it in both places.
 */
export const tickets = sqliteTable("tickets", {
  id: text("id").primaryKey(),
  number: integer("number").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  status: text("status").notNull().default("backlog"),
  priority: text("priority").notNull().default("medium"),
  label: text("label"),
  owner: text("owner"),
  plan: text("plan"),
  outcome: text("outcome"),
  evidence: text("evidence").notNull().default("[]"),
  createdBy: text("created_by").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const comments = sqliteTable("comments", {
  id: text("id").primaryKey(),
  ticketId: text("ticket_id").notNull(),
  author: text("author").notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull(),
});

export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  ticketId: text("ticket_id").notNull(),
  kind: text("kind").notNull(),
  fromStatus: text("from_status"),
  toStatus: text("to_status"),
  actor: text("actor").notNull(),
  note: text("note"),
  createdAt: text("created_at").notNull(),
});
