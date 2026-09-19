# The RaaS Agentic Engineering Playbook

**RAG-as-a-Service (RaaS) edition · v0.1 · adapted from
[The Agentic Engineering Playbook](https://www.agenticamit.com/resources/agentic-engineering-playbook)**

A practical operating system for engineers building RAG-as-a-Service products
with AI agents. Copy this repository, replace the `<placeholders>`, and your
AI agents get: safety rules, quality gates, retrieval evals, tenant-isolation
policy, and evidence-based handoffs — from day one.

> Core mechanism: agents increase the **rate of attempted change**.
> In RaaS, verification must raise the rate of **trustworthy feedback**:
> retrieval evals, tenant-isolation tests, and cost/latency checks.
> If generation outruns verification, you ship *faster wrong answers to every
> tenant at once*.

---

## 0. What RaaS changes about agentic engineering

A coding agent working on a RaaS product is more dangerous than usual because:

1. **Changes blast across all tenants.** A chunking tweak or embedding-model
   swap silently degrades every customer's answers — no crash, no error log.
2. **Quality is statistical, not binary.** Tests can pass while answer quality
   quietly drops 15%. Only eval suites notice.
3. **Data is the product.** Ingestion bugs corrupt retrieval corpora; agents
   must never "fix" data casually.
4. **Cost is per-query and compounding.** Prompt bloat or re-ranking additions
   are invisible in unit tests but show up on the invoice.
5. **Tenant isolation is a hard wall.** Cross-tenant leakage is a security
   incident, not a bug.

Therefore the playbook adds three things on top of generic agentic engineering:
**retrieval evals as merge gates**, **tenant-isolation policy for agents**,
and **change-tier rules for quality-affecting parameters**.

---

## 1. Operating principles (RaaS edition)

1. **Define the outcome before delegating the implementation.** Every task gets
   the 9-field contract (§2) with observable acceptance criteria.
2. **Keep repository instructions short; route to deeper truth.** Root
   `AGENTS.md` is a router. Detail lives in `playbook/`, ADRs, and eval docs.
3. **Route by risk, not model prestige.** Boilerplate → cheap lane. Anything
   touching retrieval, ranking, prompts, or tenant data → deep lane + evals.
4. **One writer, one worktree, one branch.** Parallel agents only with
   independent write sets; retrieval-quality experiments may race, then the
   winner merges with eval evidence.
5. **Permissions as a product surface.** Default deny. Agents get repo +
   sandbox; never tenant data, production corpora, or LLM provider keys.
6. **Deterministic policy outside the model.** Tier rules, thresholds, and
   approval boundaries live in CI config and this playbook — not in prompts.
7. **Proof is part of the deliverable.** Eval scores before/after, isolation
   test results, cost deltas, and the diff travel with every change.
8. **State lives outside the context window.** Git, ADRs, eval reports, and
   run handoffs carry decisions — never "the conversation".

**Optimize for:** accepted, reviewable changes per engineering hour; answer
faithfulness; retrieval hit-rate; cross-tenant leak count (target: 0);
cost per accepted outcome; p95 latency; not "lines generated".

---

## 2. The RaaS task contract

Every agent task fills nine fields (template: `playbook/templates/task-contract.md`):

| # | Field | RaaS-specific guidance |
|---|---|---|
| 1 | Objective | User-visible outcome: "tenants see answers grounded in their docs" |
| 2 | In scope | Named services/files; e.g. `ingest/`, `retrieve/`, one prompt template |
| 3 | Out of scope | Usually: chunking params, embedding model, tenant schemas |
| 4 | Constraints | p95 latency, $/query budget, provider rate limits, data-residency |
| 5 | Sources of truth | API schema, eval golden sets, ADRs, tenant config schema |
| 6 | Acceptance criteria | **Eval metrics with thresholds** (§4), isolation tests green |
| 7 | Evidence | Eval report before/after, cost delta, command + exit codes |
| 8 | Risk & approvals | Tier from §5; named approver for high tier |
| 9 | Stop conditions | Eval regression below threshold, leak-test failure, repeated failure |

**Acceptance criteria are observations, not vibes.** Weak: "improve retrieval."
Strong: "hit-rate@5 ≥ 0.85 on golden set v3 (237 Q/A pairs); faithfulness ≥ 0.9;
p95 retrieval latency ≤ 300ms; no cross-tenant hits."

---

## 3. Repository setup for a RaaS project (agent-readable)

```
raas/                        # your product repo — organize like this:
├── AGENTS.md                # router: rules, commands, approval boundaries
├── ingest/                  # connectors, chunking, embedding
├── retrieve/                # search, ranking, re-ranking
├── generate/                # prompts, answer synthesis, citations
├── tenants/                 # multi-tenancy: namespaces, quotas, isolation
├── evals/
│   ├── golden/              # versioned Q/A golden sets per tenant type
│   ├── metrics/             # hit-rate@k, MRR, faithfulness, hallucination
│   └── reports/             # timestamped eval runs (append-only)
├── docs/
│   ├── ARCHITECTURE.md
│   ├── adr/                 # model choices, chunking strategy, providers
│   └── memory/              # agent session handoff
└── .github/workflows/ci.yml # gates per §5
```

Rules agents must follow in a RaaS repo:

- Eval golden sets are **versioned fixtures** — changes need human approval
  and a changelog entry (they define "correct").
- Prompt templates, chunking config, and model IDs live **under version
  control**; agents never hardcode them in code.
- Tenant data never enters prompts, logs, fixtures, or eval sets. Synthetic
  data only.
- `evals/reports/` is append-only; an agent never edits an old report.

---

## 4. Retrieval quality evals (the core gate)

No change merges without eval evidence. Minimum viable eval suite:

| Metric | What it measures | Typical gate |
|---|---|---|
| hit-rate@k | relevant chunk in top-k | ≥ 0.85 (tune per product) |
| MRR / nDCG@10 | ranking quality | no regression > 2% |
| faithfulness | answer grounded in retrieved chunks | ≥ 0.90 |
| answer relevance | answers the actual question | ≥ 0.85 |
| hallucination rate | claims absent from sources | ≤ 2% |
| cross-tenant leak | foreign-tenant chunks in results | **= 0 (hard gate)** |
| cost / p95 latency | $ per query, retrieval+generation ms | within budget |

Practices:

- **Golden sets**: 100–500 Q/A pairs per tenant *type* (not real tenant data).
  Curated by humans; versioned; diffed in PRs.
- **Run before and after** every change in tiers M and H (§5); paste both
  reports into the PR evidence block.
- **Statistical care**: small eval deltas (< noise threshold) are not wins.
  Re-run or enlarge the set before claiming improvement.
- **Fault-injection**: empty index, provider 429/500, oversized doc, malformed
  query — the answer path must degrade gracefully, loudly, and cheaply.
- **Canary tenant**: stage quality-affecting changes to an internal tenant
  first; compare live evals before full rollout.

---

## 5. Change tiers for RaaS (CI + approval rules)

**The agent never self-lowers a tier.**

| Tier | Typical changes | Required gates | Human approval |
|---|---|---|---|
| **L** (low) | UI copy, docs, dev tooling, tests | lint+type+unit | diff owner |
| **M** (moderate) | prompt template edits, re-ranker params, new connector, API endpoint | full suite + **eval suite** + cost check | code owner |
| **H** (high) | embedding model swap, chunking strategy, retriever core, tenant-schema change, retention policy | full suite + eval suite on **all** golden sets + leak tests + canary tenant + rollback rehearsal | **named accountable approver** |

Tier drivers: does it touch retrieval/ranking/generation quality? tenant data
or schema? billing path? data residency? If two tiers argue, take the higher.

---

## 6. Tenant isolation — agent policy

Hard rules, no exceptions, no "temporary" exceptions:

1. Agents never query production tenant stores. Local/synthetic corpora only.
2. Every retrieval change runs the **leak test**: fixture with tenants A and B,
   assert zero B-chunks surface in A's session, and vice versa.
3. Namespace/tenant filters are enforced server-side (row-level security or
   equivalent), never only in application code the agent edits freely.
4. Deletion requests (tenant offboarding, GDPR): agent prepares the plan and
   dry-run diff; **a human executes**.
5. Embeddings of tenant data never leave the region/residency boundary in
   configs the agent writes; provider routing is config-gated and reviewed.

---

## 7. Cost & latency budgets

- Every task contract states a **$-per-query delta allowance** (e.g. "≤ +5%").
- CI records token counts and latency for a fixed benchmark query set; a
  regression > threshold fails the build — same as a failing test.
- Agents may propose caching (semantic cache, chunk cache); cache invalidation
  correctness is tier-M by default, tier-H if it touches tenant switching.
- Watch compounding costs: bigger chunks → fewer vectors but worse precision
  → more re-ranking → more tokens. Eval the whole route, not one knob.

---

## 8. Non-delegable approvals (human-only, RaaS list)

- embedding/chunking/ranking model swaps
- retention, deletion, or residency policy changes
- production tenant data operations (backfills, migrations, purges)
- provider/API key issuance or rotation
- pricing, quota, or rate-limit changes
- golden-set (eval definition) changes
- weakening any gate, including eval thresholds
- public-facing prompt/system-persona changes
- accepting residual risk after any material eval finding

---

## 9. Evidence & recovery (RaaS ladders)

**Evidence ladder:** format → unit → integration → **eval suite (tiered)** →
leak tests → cost/latency benchmark → canary tenant report.
A lower rung fails ⇒ stop; fix; restart.

**Verification ≠ self-report.** "Retrieval looks better" is a claim.
`evals/reports/2026-09-20-hitrate-0.87-before-0.83-after.json` is evidence.

**Recovery ladder** on a failed run or live regression:

1. stop rollout / stop the run; 2. classify (ingest? retrieve? generate?
tenant config? provider?); 3. return to last verified eval state (model+config
pins make this possible); 4. preserve eval reports and traces (redacted);
5. one recovery: narrow, revert (model/config pins), repair env, or escalate;
6. re-run from clean boundary; 7. add the golden-set case that would have
caught it.

**Rollback = re-pin.** Keep model IDs, chunking params, prompts, and index
schema versions pinned and reversible. If you cannot roll back an ingestion
change, it is tier-H with a rehearsed rollback, or it does not ship.

---

## 10. RaaS anti-patterns (agent-specific)

| Anti-pattern | Why it hurts | Countermeasure |
|---|---|---|
| **Vibe-checked retrieval** | quality drifts silently | eval gates on every M/H change |
| **Golden-set tuning loop** | agent overfits the eval set | eval set edited by humans only; holdout set |
| **One-number bragging** | hit-rate up, faithfulness down | report the full metric table |
| **Shared dev index** | cross-tenant/test contamination | per-run ephemeral indexes |
| **Prompt-and-pray** | fluent ≠ grounded | faithfulness + citation checks |
| **Agent as own reviewer** | authoring context anchors review | fresh-context, read-only reviewer |
| **Data "cleanup" by agent** | corpus corruption | ingestion changes are tier-M/H, dry-run diffs |
| **Cost-blind upgrades** | invoice shock | benchmark cost gate in CI |
| **Conversation as memory** | decisions lost mid-incident | ADRs, run handoffs, pinned configs |

---

## 11. Adoption checklist (for a dev taking this playbook)

- [ ] Copy this repo; rename; fill `<placeholders>` in README/AGENTS/SOURCES
- [ ] Create `evals/golden/` v1 (50+ pairs per tenant type, synthetic)
- [ ] Wire `ci.yml`: lint+type+unit always; eval suite on M/H-path changes
- [ ] Pin model IDs, chunking params, prompts in versioned config
- [ ] Set the leak test up with two fixture tenants
- [ ] Record baseline eval report + benchmark cost/latency; commit to repo
- [ ] Read `AGENTS.md`, `docs/EVIDENCE.md`, this playbook — in that order
- [ ] First agent task: use `playbook/templates/task-contract.md`, full 9 fields

---

## 12. Source ledger

- Agentic Amit, *The Agentic Engineering Playbook* (Ed. 1.0) — operating
  system, task contract, evidence/recovery ladders, tier model, anti-patterns:
  https://www.agenticamit.com/resources/agentic-engineering-playbook
- Mike McQuaid, *Sandboxes and Worktrees* (2026) — worktree-per-agent,
  sandboxing, human-reviews-human-pushes:
  https://mikemcquaid.com/sandboxed-agent-worktrees-my-coding-and-ai-setup-in-2026/
- Claude Code Docs, *Run parallel sessions with worktrees* — worktree
  mechanics, bootstrap, cleanup: https://code.claude.com/docs/en/worktrees
- RAG eval metric conventions (hit-rate@k, MRR, faithfulness, hallucination
  rate) follow common RAG-benchmarking practice; set your own thresholds from
  your baseline.
