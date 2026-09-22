import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { count } from "drizzle-orm";
import * as schema from "./schema";
import { DATABASE_URL } from "./config";
import { seed } from "./seed";

const DDL = [
  `CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'backlog',
    priority TEXT NOT NULL DEFAULT 'medium',
    label TEXT,
    owner TEXT,
    plan TEXT,
    outcome TEXT,
    evidence TEXT NOT NULL DEFAULT '[]',
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    ticket_id TEXT NOT NULL,
    author TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    ticket_id TEXT NOT NULL,
    kind TEXT NOT NULL,
    from_status TEXT,
    to_status TEXT,
    actor TEXT NOT NULL,
    note TEXT,
    created_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_events_ticket ON events(ticket_id, created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_comments_ticket ON comments(ticket_id, created_at)`,
];

export type Db = ReturnType<typeof drizzle<typeof schema>>;

// One connection and one schema check per process. Opened lazily so that importing this
// module (which `next build` does to inspect the routes) never touches the file system.
// Next.js dev reloads modules, so the singletons live on globalThis.
const g = globalThis as unknown as { __cockpit?: { client: Client; db: Db; ready: Promise<void> } };

function open() {
  if (!g.__cockpit) {
    if (DATABASE_URL.startsWith("file:")) mkdirSync(dirname(DATABASE_URL.slice(5)), { recursive: true });
    const client = createClient({ url: DATABASE_URL });
    const db = drizzle(client, { schema });
    const ready = (async () => {
      for (const sql of DDL) await client.execute(sql);
      const [{ n }] = await db.select({ n: count() }).from(schema.tickets);
      if (n === 0) await seed(db);
    })();
    g.__cockpit = { client, db, ready };
  }
  return g.__cockpit;
}

/** The Drizzle handle, once the schema exists and the demo data is in place. */
export async function ready(): Promise<Db> {
  const c = open();
  await c.ready;
  return c.db;
}
