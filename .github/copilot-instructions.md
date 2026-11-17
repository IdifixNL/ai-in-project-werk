# Instructions for GitHub Copilot

Read `AGENTS.md` in the root of this repo before anything else and follow it. It is the contract for
every AI assistant here: the board, the ticket lifecycle, the one rule the server enforces, the roles,
and how to get the app running (`START.md`).

- Your roles are in `.github/agents/` (project-manager, builder). The user picks one in the agent
  picker of Copilot Chat, or names it in the request.
- Board calls are `curl` with a JSON body. On Windows run them in Git Bash; in PowerShell use
  `curl.exe` with the body in a file (`-d @body.json`). See "Your terminal" in `AGENTS.md`.
- When you add a role, write it in `.github/agents/<name>.agent.md` and also in `.claude/agents/<name>.md`,
  so the team works the same in Claude Code.
