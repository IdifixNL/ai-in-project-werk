# Prompts for GitHub Copilot

What to type into Copilot Chat, in order. Before you start:

- Open this folder in VS Code (File, Open Folder).
- Open Copilot Chat and switch it to **Agent** mode. In Ask or Edit mode Copilot cannot run commands.
- Pick the strongest model in the model list.
- On Windows, use Git Bash as your terminal. This repo sets it as the default in VS Code; it applies to
  a newly opened terminal.

Copilot asks before it runs a command. Click Continue. That is normal.

Using Claude Code instead? The same prompts work. Start `claude` in this folder and name the role in
your sentence ("Use the builder, ...") instead of picking it from a list.

## 1. Get it running

```
Read AGENTS.md and START.md in this repo. Then follow START.md step by step to get the application running for me. I am on Windows. Run the dev server in a background terminal.
```

Change "Windows" to "Mac" if that is what you use. When it is done, open http://localhost:3000 and type
your name in the top bar. The workshop guide is under **Oefening instructie** in the left menu.

## 2. Your first ticket

Pick **builder** in the agent list of the chat, then:

```
Pick up DEMO-18 from the board and work it. Follow the board contract in AGENTS.md: write the AI Plan before any code, finish in review, never done.
```

Watch the board while it works. Then review the ticket in the app: approve, or request changes with a
reason. If you sent it back, ask the builder to pick it up again.

## 3. Tell the team about your project

Pick **project-manager** in the agent list, then:

```
I want to tell you what my project is about. Interview me and fill in docs/project.md.
```

## 4. Turn a wish into tickets

Still **project-manager**:

```
I want [what you want, in plain words]. Turn this into tickets in the backlog. Show me the titles first.
```

Move the tickets you agree with to todo yourself, or say so in the chat. Then hand one to the builder
(step 2, with its ticket number).

## 5. Add a role to your team

```
Create a tester agent in the same style as the builder. Write it in both .github/agents/tester.agent.md and .claude/agents/tester.md. The tester checks a ticket in review: runs the commands from the evidence, opens the files mentioned, and posts a comment with a verdict. It never moves tickets and never changes code.
```

Read the new file yourself before you use it. If a rule is missing, add it.

## If the roles are not in the agent list

Older versions of VS Code do not show the roles from `.github/agents/`. Name the role in the prompt instead:

```
Act as the builder described in .github/agents/builder.agent.md. Pick up DEMO-18 from the board and work it.
```

The same works for `project-manager.agent.md`. Updating VS Code also fixes it.

## If something breaks

```
The app does not work. This is what I see: [paste the error]. Use the section "Helping someone get it running" in AGENTS.md and fix it for me.
```

You may write in Dutch. Copilot answers in the language you use.
