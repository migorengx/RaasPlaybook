# raas-agentic-playbook

A specialized **Agentic Engineering Playbook for RAG-as-a-Service (RaaS)**
teams. Give it to any developer building RAG products: their AI agents get
safety rules, retrieval evals as merge gates, tenant-isolation policy, and
evidence-based handoffs from day one.

**The deliverable is [`playbook/PLAYBOOK.md`](./playbook/PLAYBOOK.md).**

## For a new dev (adoption path)

1. Read [`playbook/PLAYBOOK.md`](./playbook/PLAYBOOK.md) (30 min)
2. Copy this repo as your project's starting point, or copy `playbook/`
   into your existing RaaS repo
3. Follow the adoption checklist in PLAYBOOK §11
4. Use `playbook/templates/` (task contract, PR evidence block, run handoff)

## Repo layout

```
playbook/            # the deliverable — the playbook + copy-paste templates
AGENTS.md            # rules for agents working on THIS repo
docs/                # ADRs, memory bank, evidence system, sources manifest
.github/             # PR/issue templates, CI scaffold
src/, tests/         # (unused here — this is a docs product)
```

## Sources

Built on the [Agentic Engineering Playbook](https://www.agenticamit.com/resources/agentic-engineering-playbook)
(Agentic Amit), worktree/sandbox practice (McQuaid 2026, Claude Code docs),
specialized for RaaS failure modes. Full ledger: PLAYBOOK §12.
