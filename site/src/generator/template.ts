import type { PlaybookConfig } from './config'
import { PRODUCT_TYPE_LABEL } from './config'

const fmt = (n: number) => n.toString()

/**
 * Generate a complete, customized agentic engineering playbook (markdown)
 * from the given configuration.
 */
export function generatePlaybook(c: PlaybookConfig): string {
  const t = c.thresholds
  const isMultiTenant = c.productType === 'raas'
  const isInternal = c.productType === 'internal-rag'
  const depth = c.teamMaturity

  const out: string[] = []

  out.push(`# The ${c.productName} Agentic Engineering Playbook`)
  out.push('')
  out.push(`**Product type: ${PRODUCT_TYPE_LABEL[c.productType]} · generated playbook · customize freely**`)
  out.push('')
  out.push(`An operating system for building ${isMultiTenant ? 'RAG-as-a-Service' : isInternal ? 'internal RAG' : 'retrieval-grounded chatbot'} software with AI agents.`)
  out.push('')
  out.push('> Core mechanism: agents increase the **rate of attempted change**.')
  out.push('> Verification must raise the rate of **trustworthy feedback**: retrieval')
  out.push('> evals, isolation tests, and cost/latency checks. If generation outruns')
  out.push('> verification, you ship faster wrong answers.')
  out.push('')
  out.push('---')
  out.push('')

  // §0 What your product type changes
  out.push('## 0. What this product type changes about agentic engineering')
  out.push('')
  out.push('1. **Quality is statistical, not binary.** Tests can pass while answer')
  out.push('   quality quietly drops. Only eval suites notice.')
  out.push('2. **Retrieval changes blast silently.** A chunking tweak or model swap')
  out.push('   degrades answers with no crash and no error log.')
  out.push('3. **Data is the product.** Ingestion bugs corrupt retrieval corpora;')
  out.push('   agents must never "fix" data casually.')
  out.push('4. **Cost is per-query and compounding.** Prompt bloat and re-ranking')
  out.push('   are invisible in unit tests but visible on the invoice.')
  if (isMultiTenant) {
    out.push('5. **Tenant isolation is a hard wall.** Cross-tenant leakage is a')
    out.push('   security incident, not a bug. Every retrieval change runs leak tests.')
  } else if (isInternal) {
    out.push('5. **Access control still matters.** Department-level doc visibility must')
    out.push('   survive retrieval changes; run permission-scope tests on every change.')
  } else {
    out.push('5. **Public trust is at stake.** A grounded answer with a wrong citation')
    out.push('   damages the brand; citation checks are a hard gate.')
  }
  out.push('')

  // §1 Principles
  out.push('## 1. Operating principles')
  out.push('')
  out.push('1. **Define the outcome before delegating implementation.** Every task')
  out.push('   gets the 9-field contract (§2) with observable acceptance criteria.')
  out.push('2. **Keep repo instructions short; route to deeper truth.** Root')
  out.push('   `AGENTS.md` is a router; detail lives in docs, ADRs, eval configs.')
  out.push('3. **Route by risk, not model prestige.** Boilerplate → cheap lane.')
  out.push('   Retrieval, ranking, prompts, tenant data → deep lane + evals.')
  out.push('4. **One writer, one worktree, one branch.** Race quality experiments,')
  out.push('   merge the winner with eval evidence.')
  out.push('5. **Permissions are a product surface.** Default deny. Agents get repo +')
  out.push('   sandbox; never tenant data, production corpora, or provider keys.')
  out.push('6. **Deterministic policy outside the model.** Tier rules, thresholds,')
  out.push('   approval boundaries live in CI config and this playbook.')
  out.push('7. **Proof is part of the deliverable.** Eval before/after, isolation')
  out.push('   results, cost deltas, and the diff travel with every change.')
  out.push('8. **State lives outside the context window.** Git, ADRs, eval reports,')
  out.push('   run handoffs — never "the conversation".')
  out.push('')

  // §2 thresholds
  out.push('## 2. Quality gates for ' + c.productName)
  out.push('')
  out.push('No change merges without eval evidence. This project\'s gates:')
  out.push('')
  out.push('| Metric | Gate |')
  out.push('|---|---|')
  out.push(`| hit-rate@5 | ≥ ${fmt(t.hitRateAt5)} |`)
  out.push('| MRR / nDCG@10 | no regression > 2% |')
  out.push(`| faithfulness | ≥ ${fmt(t.faithfulness)} |`)
  out.push('| answer relevance | ≥ 0.85 |')
  out.push(`| hallucination rate | ≤ ${fmt(t.hallucinationMax)}% |`)
  out.push(isMultiTenant
    ? '| cross-tenant leak | **= 0 (hard gate)** |'
    : '| permission-scope violations | **= 0 (hard gate)** |')
  out.push(`| p95 latency | ≤ ${fmt(t.latencyP95Ms)}ms |`)
  out.push(`| cost per query delta | ≤ +${fmt(t.costDeltaMaxPct)}% |`)
  out.push('')

  // §3 task contract
  out.push('## 3. The task contract (9 fields)')
  out.push('')
  out.push('Every agent task states: **objective · in scope · out of scope ·')
  out.push('constraints · sources of truth · acceptance criteria · required')
  out.push('evidence · risk & approvals · stop conditions.**')
  out.push('')
  out.push('Acceptance criteria are observations, not vibes. Weak: "improve')
  out.push('retrieval." Strong: "hit-rate@5 ≥ ' + fmt(t.hitRateAt5) + ' on golden set vX;')
  out.push('faithfulness ≥ ' + fmt(t.faithfulness) + '; p95 ≤ ' + fmt(t.latencyP95Ms) + 'ms; zero scope leaks."')
  out.push('')

  // §4 tiers
  out.push('## 4. Change tiers')
  out.push('')
  out.push('**The agent never self-lowers a tier.**')
  out.push('')
  out.push('| Tier | Typical changes | Gates | Approval |')
  out.push('|---|---|---|---|')
  out.push('| **L** | UI copy, docs, tooling, tests | lint+type+unit | diff owner |')
  out.push('| **M** | prompts, re-ranker params, connectors, API endpoints | full suite + evals + cost check | code owner |')
  out.push('| **H** | embedding swap, chunking strategy, retriever core, ' + (isMultiTenant ? 'tenant schema, retention policy' : 'permission model, data retention') + ' | all golden sets + leak/scope tests' + (c.include.canary ? ' + canary' : '') + ' + rollback rehearsal | **named approver** |')
  out.push('')

  // §5 isolation
  out.push('## 5. Data isolation — agent policy')
  out.push('')
  out.push('1. Agents never query production ' + (isMultiTenant ? 'tenant' : 'user') + ' stores. Local/synthetic corpora only.')
  out.push('2. Every retrieval change runs the leak/scope test with fixture ' + (isMultiTenant ? 'tenants A and B; assert zero cross-hits.' : 'roles; assert zero privilege escalation.'))
  out.push('3. Access filters are enforced server-side (row-level security or equivalent), never only in app code.')
  out.push('4. Deletion/offboarding: agent prepares plan + dry-run diff; **a human executes**.')
  out.push('5. Data never enters prompts, logs, fixtures, or eval sets. Synthetic only.')
  out.push('')

  // §6 cost
  out.push('## 6. Cost & latency budgets')
  out.push('')
  out.push('- Every contract states a $-per-query delta allowance (default ≤ +' + fmt(t.costDeltaMaxPct) + '%).')
  out.push('- CI benchmarks a fixed query set; regression > threshold fails the build.')
  out.push('- Caching proposals are welcome; cache invalidation correctness is reviewed as tier M+.')
  out.push('- Eval the whole route: chunking → retrieval → re-rank → generation.')
  out.push('')

  // §7 evals
  out.push('## 7. Eval suite')
  out.push('')
  out.push('- **Golden sets**: 100–500 Q/A pairs per user type, synthetic, human-curated, versioned.')
  out.push('- Run before/after every M/H change; paste both reports in the PR.')
  out.push('- Small deltas (< noise) are not wins; re-run or enlarge the set.')
  out.push('- Fault-injection: empty index, provider 429/500, oversized doc, malformed query.')
  out.push('- Hold out a private golden subset the agent never sees (anti-overfitting).')
  out.push('')

  if (c.include.worktrees) {
    out.push('## 8. Worktrees & parallel agents')
    out.push('')
    out.push('```bash')
    out.push('git worktree add .worktrees/feat-x -b feat/x')
    out.push('cd .worktrees/feat-x && ./scripts/bootstrap   # deps + env')
    out.push('# agent session here; human reviews + pushes')
    out.push('git worktree remove .worktrees/feat-x')
    out.push('```')
    out.push('')
    out.push('One writer per worktree. `.worktreeinclude` copies non-secret env files.')
    out.push('')
  }

  if (c.include.sandboxing) {
    out.push('## 9. Sandboxing')
    out.push('')
    out.push('Built-in agent sandbox for everyday work; devcontainer for stack parity;')
    out.push('VM/separate user for heavy fleets. Scoped short-lived tokens only.')
    out.push('Agents propose infrastructure actions; humans execute.')
    out.push('')
  }

  // §10 non-delegable
  out.push('## ' + (c.include.worktrees || c.include.sandboxing ? '10' : '8') + '. Non-delegable approvals (human-only)')
  out.push('')
  out.push('- embedding/chunking/ranking model swaps · retention, deletion, residency policy')
  out.push('- production data operations (backfills, migrations, purges)')
  out.push('- provider key issuance/rotation · pricing/quota/rate-limit changes')
  out.push('- golden-set (eval definition) changes · public prompt/persona changes')
  out.push('- weakening any gate or threshold · accepting residual risk')
  out.push('')

  // §11 recovery
  out.push('## ' + (c.include.worktrees || c.include.sandboxing ? '11' : '9') + '. Evidence & recovery')
  out.push('')
  out.push('**Evidence ladder:** format → unit → integration → evals (tiered) → leak tests → cost/latency benchmark' + (c.include.canary ? ' → canary report.' : '.'))
  out.push('')
  out.push('**Verification ≠ self-report.** "Retrieval looks better" is a claim; an')
  out.push('append-only eval report is evidence.')
  out.push('')
  out.push('**Recovery ladder:** stop rollout → classify (ingest/retrieve/generate/provider) → return to last verified eval state → preserve redacted evidence → one recovery (revert via config pins) → re-run clean → add the golden case that would have caught it.')
  out.push('')
  out.push('**Rollback = re-pin.** Model IDs, chunking params, prompts, index schema are pinned and reversible; if you cannot roll back an ingestion change, it is tier H with rehearsed rollback, or it does not ship.')
  out.push('')

  // §12 maturity add-ons
  if (depth === 'platform') {
    out.push('## 12. Platform governance (multi-team)')
    out.push('')
    out.push('- Monthly scorecard: accepted changes/week, escaped defects, eval pass rate, cost per accepted change, policy violations.')
    out.push('- Policy-as-code for tiers and approvals; logged rule versions.')
    out.push('- Central golden-set registry; teams inherit and extend.')
    out.push('- Control owners named per gate (evals, isolation, cost, approvals).')
    out.push('')
  } else if (depth === 'solo') {
    out.push('## 12. Solo mode')
    out.push('')
    out.push('- You are reviewer, approver, and operator: keep diffs small, evals green, and push only what you have read.')
    out.push('- Weekly: re-run full eval suite; archive report; prune stale branches/worktrees.')
    out.push('')
  }

  if (c.include.adrs) {
    out.push('## Decision records')
    out.push('')
    out.push('Durable choices (model, chunking, provider, index schema) get an ADR:')
    out.push('context, decision, alternatives, consequences, evidence, revisit-when.')
    out.push('')
  }

  out.push('---')
  out.push('')
  out.push('**Security contact:** ' + c.securityContact)
  out.push('')
  out.push('*Generated from the raas-agentic-playbook generator. Sources: The Agentic')
  out.push('Engineering Playbook (agenticamit.com); McQuaid 2026 worktree/sandbox')
  out.push('practice; Claude Code worktree docs.*')

  return out.join('\n') + '\n'
}
