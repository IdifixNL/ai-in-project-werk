# Cockpit Starter

A small command board for an AI-assisted project team. Next.js 16 (App Router),
Drizzle, SQLite (`@libsql/client`), Tailwind v4. No auth, localhost only.

## Commands

- `npm run dev` starts the app on http://localhost:3000 (creates and seeds `data/cockpit.db` on first start)
- `npm run build && npm start` production build
- `npm run lint` and `npx tsc --noEmit` must both be clean before a ticket goes to review
- `docker compose up` runs the same thing in a container

## Where things live

- `src/lib/kanban.ts` all ticket logic and the one server rule
- `src/lib/schema.ts` Drizzle tables; matching `CREATE TABLE` DDL in `src/lib/db.ts` (edit both when you add a column)
- `src/lib/seed.ts` demo data, only inserted when the database is empty
- `src/lib/config.ts` project name and ticket prefix
- `src/app/api/**` REST route handlers, documented in `docs/api.md`
- `src/app/page.tsx` dashboard, `src/app/board/page.tsx` board
- `src/components/**` UI; `src/app/globals.css` design tokens (dark default, light via `data-theme`)

## The board contract (read this before touching a ticket)

The board at http://localhost:3000/board is where work is tracked. Talk to it through the REST API
with `curl`. Full reference: `docs/api.md`.

Columns: `backlog -> todo -> in_progress -> review -> done`

| Tab | Field | Owner | Rule |
|-----|-------|-------|------|
| Request | `description` | human | Never rewrite someone else's request. Scope changes go in a comment. |
| AI Plan | `plan` | agent | Written when you pick the ticket up, BEFORE any code. Restate the request, list the approach, name what is out of scope and what evidence you will attach. |
| Result | `outcome` + `evidence` | agent | A real verdict (what you did, how you checked it) plus at least one piece of evidence (test output, screenshot path, curl output). |
| Journey | events | server | Every transition is logged with the actor. Do not fake it. |

Every write carries an `actor`. Agents use `agent:<name>`, humans `human:<name>`.

**Hard rule, enforced by the server: an agent can never set `status: "done"`.** You finish at
`review`. A human approves or sends it back. If you get a 403, that is the system working.

### Team roles in this repo

- `.claude/agents/project-manager.md` turns a conversation into tickets in `backlog`. Moves a ticket to `todo` only when the human says so. Never builds.
- `.claude/agents/builder.md` picks up ONE ticket from `todo`, plans, builds, delivers to `review`. Never creates tickets for itself.
- The human promotes `backlog -> todo` and decides `review -> done` or `review -> backlog` with a note.

### Working a ticket (builder)

1. Pick a ticket from `todo` (never from `backlog`; a human decides what is ready).
2. Move it to `in_progress`, set yourself as owner, and write the AI Plan in the same call:
   `PATCH /api/kanban/DEMO-7 {"status":"in_progress","owner":"agent:builder","plan":"...","actor":"agent:builder"}`
3. Do the work. Run lint and type-check.
4. Write the result and evidence, then move to review, in one call:
   `PATCH /api/kanban/DEMO-7 {"status":"review","outcome":"...","appendEvidence":[{"caption":"npm run lint clean"}],"actor":"agent:builder"}`
5. If something in the request turned out wrong or bigger than expected, say so in a comment:
   `POST /api/kanban/DEMO-7/comments {"author":"agent:builder","content":"..."}`
6. Stop. Do not move to done.

If a human sent a ticket back (status went `review -> backlog` with a note in the Journey), address that note first.

## Conventions

- Keep the skeleton small. Add a file when a concept needs a home, not before.
- Plain SVG for charts, no chart library.
- No em-dashes or en-dashes in text. Use a comma, colon, or full stop.
- British spelling in UI copy.

@AGENTS.md
