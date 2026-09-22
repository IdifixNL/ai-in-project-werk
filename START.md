# START.md

Instructions for Claude Code. The user has just cloned this repo and asked you to read this file
and get the application running for them. Do the steps below yourself, in order. Talk to the user
in the language they use with you (Dutch if they write Dutch). Keep your messages short.

## 1. Check the machine

Run and read the output:

```bash
node -v
npm -v
git --version
```

- Node must be 20 or newer. If it is missing or older, stop and tell the user to install the LTS
  from https://nodejs.org (Windows: the .msi installer, then reopen the terminal). Then continue.
- On Windows, make sure you are running commands in Git Bash (Claude Code does this by default).
  PowerShell is not suitable for the curl commands used in this project.

## 2. Install

```bash
npm install
```

Takes 10 to 60 seconds. There is no compile step: SQLite and the Next.js compiler come as prebuilt
binaries. If `npm install` fails, read the error and fix the cause (usually network or an old Node).
Do not switch to yarn or pnpm.

## 3. Start the app

Start the dev server as a background process so the user keeps their terminal:

```bash
npm run dev
```

Then verify it answers:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/stats
```

Expect `200`. The first request creates and seeds `data/cockpit.db` (21 demo tickets).

- If port 3000 is taken, restart with `npm run dev -- -p 3001` and tell the user the new URL. Use
  that port in every curl you run later in this session.
- If the page errors after a crash, stop the server, delete `data/cockpit.db`, start again.

## 4. Hand over to the user

Tell them, in this order:

1. Open http://localhost:3000 (or the port you used). The dashboard is the first page.
2. Type their name in the top bar. That name is logged on everything they do on the board.
3. Open **Oefening instructie** in the left menu. That is the workshop guide, in Dutch, eight chapters.
   Chapter 1 explains the board, chapter 2 is their first ticket, chapter 3 introduces the
   project manager.
4. Say that you are ready to be their team: they can ask for the project-manager agent to tell you
   about their project, or the builder agent to work a ticket. Point at `CLAUDE.md` as the contract
   you follow.

Then stop and wait. Do not create tickets, do not change code, do not start a project brief until
the user asks.

## If something else goes wrong

Read `CLAUDE.md`, section "Helping someone get it running". Diagnose, fix, verify with the curl
above, and tell the user what was wrong in one sentence.
