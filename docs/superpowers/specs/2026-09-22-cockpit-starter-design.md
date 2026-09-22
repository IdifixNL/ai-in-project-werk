# Cockpit Starter, design (2026-09-22)

Workshop starter kit for the "AI in projectwerk" training (Conclusion talent
programme, 12-13 participants, mixed Mac/Windows laptops). Participants clone
the repo, run it locally, connect a Claude Code team to the board and extend
the dashboard for their own project.

Render approved by Nico: https://claude.ai/artifact/GzM76oyscbd7BympCM3QMb

## Decisions

- Stack as the Cockpit/Flightdeck lineage: Next.js 16 App Router, Drizzle,
  SQLite, Tailwind v4. SQLite driver is `@libsql/client` (prebuilt binaries,
  no C++ toolchain on Windows). No auth: localhost only.
- Ticket contract identical in field names to the Cockpit so the protocol
  transfers 1:1: `description` (Request), `plan` (AI Plan), `outcome` +
  `evidence` (Result), comments, events (Journey).
- Columns `backlog -> todo -> in_progress -> review -> done`. One server rule
  as the teaching moment: a request whose `actor` is not `human` can never set
  `status: done` (HTTP 403, and the refusal is logged as an event).
- Agent door is plain REST (curl in CLAUDE.md), no MCP. Zero setup, visible.
- Theme: dark cockpit look by default, light mode toggle, system preference
  respected, choice remembered per browser.
- House style: Montserrat, Conclusion Enablement purple `#5a3f8c` as the one
  accent, CONCLUSION logo block with vertical rainbow, purple grid line at the
  left margin, internal EN themabalk in the footer. Status colours are the
  brandguide canvas colours used semantically.
- Ships with: seeded demo board, `CLAUDE.md` (board contract + rules), one
  example `.claude/agents/builder.md`, `docs/workshop.md`, `docs/api.md`,
  `docker-compose.yml` fallback.

## Out of scope (skeleton on purpose)

Auth, multiple boards, file uploads, MCP server, second-brain, war room,
notifications, i18n.

## Pages

- `/` dashboard: 4 KPI tiles, throughput per week (8 weeks), work by column,
  recent activity, workshop hint. All from `GET /api/stats`.
- `/board`: 5 columns, drag and drop, filters by priority and label, new
  ticket dialog, ticket dialog with lifecycle stepper + tabs Request / AI Plan /
  Result / Journey and Comments below.

## API

- `GET /api/kanban` list, `POST /api/kanban` create
- `GET/PATCH /api/kanban/:id` (status, priority, label, owner, plan, outcome,
  evidence, appendEvidence; body.actor + body.note feed the event log)
- `GET/POST /api/kanban/:id/comments`
- `GET /api/kanban/:id/events`
- `GET /api/stats`

## Verification

`npm run build` clean, API smoke test via curl (create, plan, review, agent
done refused, human done accepted), `docker compose up` boots and serves.
