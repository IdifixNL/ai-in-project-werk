# Board API

Base URL: `http://localhost:3000`. JSON in, JSON out. No auth.
Tickets can be addressed by id or by ref (`DEMO-7`).

Every write carries an `actor`: `human:<name>` or `agent:<name>`. Missing actor is a 400.

## Tickets

### `GET /api/kanban`
All tickets, oldest first.

```json
[{
  "id": "…", "ref": "DEMO-7", "number": 7,
  "title": "Show revenue per client on the dashboard",
  "description": "…", "status": "backlog", "priority": "medium", "label": "dashboard",
  "owner": null, "plan": null, "outcome": null, "evidence": [],
  "createdBy": "human:Nico", "createdAt": "2026-09-22T08:00:00.000Z", "updatedAt": "…"
}]
```

`status`: `backlog | todo | in_progress | review | done`
`priority`: `low | medium | high | urgent`

### `POST /api/kanban`
```json
{ "title": "…", "description": "…", "priority": "medium", "label": "dashboard", "status": "backlog", "actor": "human:Nico" }
```
Only `title` and `actor` are required. Returns the ticket, 201.

### `GET /api/kanban/{id|ref}`
One ticket.

### `PATCH /api/kanban/{id|ref}`
Any of: `status`, `priority`, `label`, `owner`, `title`, `description`, `plan`, `outcome`,
`evidence` (replace the list), `appendEvidence` (add to it), `note` (free text stored on the event).

```json
{ "status": "in_progress", "owner": "agent:builder", "plan": "1. …\n2. …", "actor": "agent:builder" }
```
```json
{ "status": "review", "outcome": "Added the chart. Lint and tsc clean.", "appendEvidence": [{ "caption": "npm run lint clean" }, { "caption": "screenshot", "url": "file:///…/chart.png" }], "actor": "agent:builder" }
```

Responses: 200 with the updated ticket. 400 on a bad field. 404 unknown ticket.
**403 when the actor is not a human and `status` is `done`.** The attempt is logged as a `refused` event.

## Comments

### `GET /api/kanban/{id|ref}/comments`
### `POST /api/kanban/{id|ref}/comments`
```json
{ "author": "agent:builder", "content": "Plan published, starting on the API first." }
```

## Journey

### `GET /api/kanban/{id|ref}/events`
Oldest first. `kind` is one of `created | status | plan | result | comment | refused`.
```json
{ "kind": "status", "fromStatus": "todo", "toStatus": "in_progress", "actor": "agent:builder", "note": null, "createdAt": "…" }
```

## Dashboard

### `GET /api/stats`
Everything the dashboard shows: `counts` per status, `open`, `awaitingReview`, `oldestReviewHours`,
`doneThisWeek`, `doneLastWeek`, `agentSharePct`, `throughput` (8 weekly buckets), `recent` (last 8 events with `ref`).
Extend `getStats()` in `src/lib/kanban.ts` to add your own numbers.

## curl cheat sheet

```bash
B=localhost:3000/api/kanban
curl -s $B | jq '.[] | select(.status=="todo") | .ref + "  " + .title'
curl -s $B/DEMO-7
curl -s -X PATCH $B/DEMO-7 -H 'content-type: application/json' -d '{"status":"in_progress","owner":"agent:builder","plan":"...","actor":"agent:builder"}'
curl -s -X POST  $B/DEMO-7/comments -H 'content-type: application/json' -d '{"author":"agent:builder","content":"..."}'
curl -s -X PATCH $B/DEMO-7 -H 'content-type: application/json' -d '{"status":"review","outcome":"...","appendEvidence":[{"caption":"..."}],"actor":"agent:builder"}'
```
