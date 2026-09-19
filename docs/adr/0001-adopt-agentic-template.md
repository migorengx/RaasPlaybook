# 0001. Create a RaaS-specific playbook as a standalone docs product

- **Status**: accepted
- **Date**: <fill>
- **Deciders**: project owner

## Context

The generic agentic template covers software projects broadly. RAG-as-a-Service
has specific agent risks: silent quality drift across all tenants, statistical
(not binary) correctness, tenant-data isolation, and compounding per-query
costs. Other devs need these risks encoded as guidelines for their AI agents.

## Decision

Build `raas-agentic-playbook`: copy the agentic template, add
`playbook/PLAYBOOK.md` (RaaS operating system: eval gates, change tiers,
isolation policy, cost budgets, anti-patterns) plus copy-paste templates.
Ship the playbook as the product; repo tooling (AGENTS.md, CI scaffold)
governs work on the playbook itself.

## Consequences

**Positive**: RaaS teams get day-one agent guardrails; thresholds are explicit
and versioned; adoption is copy-and-fill-placeholders.

**Negative**: thresholds (hit-rate, faithfulness) are defaults — each team must
baseline and tune them; playbook needs maintenance as RAG practice evolves.
