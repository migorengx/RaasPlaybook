# Sandboxing Agents

Agents run code. Give them a box to run it in — options, cheapest first:

| Option | What | When |
|---|---|---|
| Built-in agent sandbox | Claude Code / Codex permission modes + OS sandbox | default for everyday work |
| Devcontainer | Docker container defined in `.devcontainer/` | reproducible stack, CI parity |
| VM / separate user | full isolation (e.g. macOS sandbox users, multipass) | heavy agent fleets, sensitive repos |

## Rules regardless of option

- Scoped, short-lived tokens only. No admin credentials inside agent sandboxes.
- Secrets enter via secret manager or `.env.local` copied through
  `.worktreeinclude` — never committed.
- Agent filesystem rights: the repo worktree + package caches. Nothing else.
- If an agent needs to touch infrastructure, it proposes; a human executes.

## Devcontainer (optional)

When the stack is chosen, add `.devcontainer/devcontainer.json` so agents and
CI run the same image. Until then the built-in sandbox + `make check` is enough.
