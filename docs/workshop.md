# Workshop: your AI team on a board

You have a working cockpit: a Kanban board with a lifecycle, and a dashboard that reads from it.
In the next two hours you will connect your AI assistant (Claude Code or GitHub Copilot) to it, give it a team, and let that team
extend the dashboard for a project of your own. You stay the reviewer throughout.

## 0. Before you start (10 min)

1. Node 20 or newer: `node -v`. Docker is the fallback if Node fights you.
2. One AI assistant, installed and signed in:
   - Claude Code: `claude --version`.
   - GitHub Copilot: VS Code with the GitHub Copilot extension, signed in, Copilot Chat set to agent mode.
   On Windows, use Git Bash as your terminal.
3. Clone and run:
   ```bash
   git clone <this repo> cockpit && cd cockpit
   npm install
   npm run dev
   ```
   Open http://localhost:3000. Type your name in the top bar. Click around: board, a ticket, the dashboard.
4. Rename it: copy `.env.example` to `.env.local`, set `PROJECT_NAME` and `TICKET_PREFIX` to your project. Restart.

## 1. Meet the contract (10 min)

Open `AGENTS.md`. This is the first thing your assistant reads in this repo (Claude Code through
`CLAUDE.md`, Copilot through `.github/copilot-instructions.md`). Find:

- the four tabs and who owns each,
- the one rule the server enforces,
- the six steps for working a ticket.

Then do it by hand once, from a terminal, using `docs/api.md`: create a ticket, move it to
`in_progress` as `agent:you`, try to move it to `done` as an agent. Watch the dashboard.

## 2. First agent, one ticket (20 min)

Start your assistant in the repo: `claude` for Claude Code, or Copilot Chat in agent mode in VS Code.

Ask it: *"Read AGENTS.md. Then pick up DEMO-18 from the board and work it."*

Watch the board while it works. Check:

- Did the AI Plan appear before code changed? Open the ticket, AI Plan tab.
- Did it end in `review`, not `done`?
- Is the evidence something you can verify yourself?

Review the ticket in the UI: approve, or request changes with a reason. If you sent it back, ask the assistant to pick it up again and see whether it reads your note.

## 3. Build the team (30 min)

One agent that does everything is where most people stop. A team is where it gets interesting.
Look at `.claude/agents/builder.md` (Claude Code) or `.github/agents/builder.agent.md` (Copilot).
That is one role: name, description, procedure, rules. The two files hold the same text.

Ask your assistant to create two more, in the same style, in both folders:

- **planner**: reads a vague backlog ticket, asks you at most three questions, rewrites nothing, and posts a comment proposing how to split it into todo-sized tickets. Never moves tickets.
- **tester**: takes a ticket in `review`, verifies the evidence is real (runs the commands, opens the files), and posts a comment with a verdict. Never moves tickets, never edits code.

Tip: ask the assistant to write the agent, then read it yourself before you use it. If a rule is missing, add it.

In Copilot you pick a role in the agent picker of the chat; in Claude Code you name it ("use the planner").

Now run the loop: planner on DEMO-19, you promote the resulting tickets to todo, builder on the first, tester on the result, you approve.

## 4. Make it yours (40 min)

The dashboard is a starting point. Its numbers come from `GET /api/stats`. Pick something your
real project tracks and put it on the dashboard:

- finance: revenue per client, hours billed per week, invoices overdue
- delivery: open risks, decisions waiting, sprint burn-down
- operations: incidents per week, SLA breaches, time to resolve

Write the request as a ticket, in plain language, the way you would for a colleague. Data can be a
CSV in the repo. Then let your team work it while you review.

Questions to hold on to while it runs:

- Was the plan good enough that you could have said "no" before any code existed?
- When the agent claimed something, could you check it without reading the code?
- What did the team do that you would not have allowed a new colleague to do?

## 5. Wrap-up (10 min)

Push your repo. Write down one rule you added to AGENTS.md or an agent, and why. That rule is the
real output of today.

## If you get stuck

- Board empty or errors on the page: stop `npm run dev`, delete `data/cockpit.db`, start again. It reseeds.
- Port 3000 taken: `npm run dev -- -p 3001` and tell your agents the new port.
- Docker instead of Node: `docker compose up --build`, then http://localhost:3000.
- The assistant cannot reach the board: it runs `curl` on your machine, so the app must be running in another terminal.
- Windows, JSON errors on curl calls: the command ran in PowerShell. Switch the terminal to Git Bash.
