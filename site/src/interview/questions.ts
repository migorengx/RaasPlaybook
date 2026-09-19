/**
 * Interview schema — Result-as-a-Service edition.
 * One question at a time; dynamic follow-ups; every question carries a
 * plain-language explanation (plain) for newcomers.
 */

export type AnswerValue = string | string[]

export interface QuestionOption {
  value: string
  label: string
  hint?: string
}

export type Widget =
  | { kind: 'text'; placeholder?: string; multiline?: boolean }
  | { kind: 'choice'; options: QuestionOption[]; customAllowed?: boolean; customPlaceholder?: string }
  | { kind: 'toggle'; options: QuestionOption[] }   // multi-select

export interface Question {
  id: string
  section: string
  prompt: string
  help?: string
  plain: string
  widget: Widget
  defaultAnswer: AnswerValue
  /** Return false to skip this question given earlier answers. */
  visibleWhen?: (a: Record<string, AnswerValue>) => boolean
  optional?: boolean
  validate?: (v: AnswerValue) => string | null
}

const YES_NO: QuestionOption[] = [
  { value: 'yes', label: 'Yes', hint: 'include it' },
  { value: 'no', label: 'No', hint: 'skip it' },
]

export const QUESTIONS: Question[] = [
  // ── The result ──────────────────────────────────────────────────────
  {
    id: 'productName', section: 'The result',
    prompt: 'What is your product called?',
    help: 'Used in document titles, generated files, and CI job names.',
    plain: 'Just a label. It shows up in document titles and generated files. You can change it later — nothing is locked in.',
    widget: { kind: 'text', placeholder: 'AcmeResults' },
    defaultAnswer: 'MyRaaS',
    validate: (v) => (typeof v === 'string' && v.trim().length > 0 ? null : 'A name is required.'),
  },
  {
    id: 'outcomeType', section: 'The result',
    prompt: 'What result do your agents deliver — the thing customers pay for?',
    help: 'This is the product. Everything in the playbook protects the integrity of this unit.',
    plain: "Result-as-a-Service means customers pay per finished result, not per seat. Naming the result precisely (one resolved ticket, one reconciled report) sets up every quality gate that follows.",
    widget: {
      kind: 'choice',
      customAllowed: true, customPlaceholder: 'describe your unit of delivery',
      options: [
        { value: 'resolution', label: 'Resolved support case', hint: 'ticket answered/fixed end-to-end' },
        { value: 'document', label: 'Produced document / report', hint: 'contract summary, audit file, analysis' },
        { value: 'transaction', label: 'Completed transaction', hint: 'processed invoice, booked meeting, fulfilled order' },
        { value: 'dataset', label: 'Validated dataset / record set', hint: 'enriched, cleaned, reconciled data' },
      ],
    },
    defaultAnswer: 'resolution',
  },
  {
    id: 'deliveryMode', section: 'The result',
    prompt: 'How does the finished result reach the customer?',
    help: 'Determines which side-effect rules the playbook enforces.',
    plain: "Delivery mode = where the agent's work ends up. Writing into the client's live systems or sending messages to real people is higher-stakes than producing a file someone downloads — so the playbook adds stricter controls for it.",
    widget: {
      kind: 'choice',
      customAllowed: true, customPlaceholder: 'describe your delivery path',
      options: [
        { value: 'artifact', label: 'Downloadable artifact', hint: 'file or report handed to the client' },
        { value: 'client-system', label: 'Written into client systems', hint: 'agent works in the client\'s tools/CRM' },
        { value: 'communications', label: 'Sent as communication', hint: 'emails/messages sent on client behalf' },
        { value: 'human-relay', label: 'Reviewed by human first', hint: 'agent drafts, human relays' },
      ],
    },
    defaultAnswer: 'artifact',
  },
  {
    id: 'autonomyLevel', section: 'The result',
    prompt: 'How much autonomy do agents have today?',
    help: 'The playbook treats raising this as a high-risk change requiring named approval.',
    plain: "Autonomy = how often a result ships without a human seeing it first. Draft-only is safest and slowest. Autonomous-with-sampling means the agent delivers everything but humans audit a slice. This dial is the single biggest risk lever in RaaS.",
    widget: {
      kind: 'choice',
      customAllowed: true, customPlaceholder: 'describe your autonomy setup',
      options: [
        { value: 'draft-only', label: 'Human approves every result', hint: 'agent drafts only' },
        { value: 'sampled', label: 'Autonomous + sampled audit', hint: 'auto-deliver, humans review a %' },
        { value: 'full', label: 'Fully autonomous', hint: 'no routine review; rollback on incidents' },
      ],
    },
    defaultAnswer: 'sampled',
  },
  {
    id: 'pricingModel', section: 'The result',
    prompt: 'How do customers pay for results?',
    help: 'Billing integrity gates are designed around this answer.',
    plain: "In Result-as-a-Service, billing is part of correctness: charging for a wrong or incomplete result is a defect like any other — actually worse, because it's a trust defect. The playbook adds reconciliation tests so billing never drifts from delivered quality.",
    widget: {
      kind: 'choice',
      customAllowed: true, customPlaceholder: 'describe your pricing',
      options: [
        { value: 'per-result', label: 'Per result', hint: 'fixed price per delivered unit' },
        { value: 'tiered', label: 'Tiered / volume', hint: 'price drops with volume' },
        { value: 'subscription-sla', label: 'Subscription + SLA', hint: 'base fee, penalties on missed SLA' },
        { value: 'prepaid-credits', label: 'Prepaid credits', hint: 'credits consumed per result' },
      ],
    },
    defaultAnswer: 'per-result',
  },
  {
    id: 'billingIntegration', section: 'The result',
    prompt: 'How does billing learn that a result was delivered?',
    help: 'The playbook generates a billing-replay test from this answer.',
    plain: "Somewhere a system turns 'result delivered' into 'customer charged'. If that wiring is manual, the gate is a monthly audit; if automated, the gate is an automated reconciliation test that replays results and checks every charge.",
    widget: {
      kind: 'choice',
      customAllowed: true, customPlaceholder: 'describe your billing path',
      options: [
        { value: 'auto-api', label: 'Automated billing API', hint: 'result event → charge' },
        { value: 'metered-platform', label: 'Metered usage platform', hint: 'Stripe meters, usage records' },
        { value: 'manual-invoice', label: 'Manual invoicing', hint: 'humans reconcile monthly' },
      ],
    },
    defaultAnswer: 'auto-api',
  },
  {
    id: 'provider', section: 'The result',
    prompt: 'Which LLM provider(s) power the agents?',
    plain: "The company (or server) that actually runs the AI model for you. 'Mixed' means more than one — common for fallback or cost savings. This changes which security rules the playbook includes.",
    widget: {
      kind: 'choice',
      customAllowed: true, customPlaceholder: 'e.g. openai + local vllm fallback',
      options: [
        { value: 'openai', label: 'OpenAI' },
        { value: 'anthropic', label: 'Anthropic' },
        { value: 'local', label: 'Local / self-hosted', hint: 'vLLM, Ollama, …' },
        { value: 'mixed', label: 'Mixed providers' },
      ],
    },
    defaultAnswer: 'mixed',
  },
  {
    id: 'keyManagement', section: 'The result',
    prompt: 'How do agents and CI get provider credentials?',
    help: 'The playbook encodes this into its secrets policy.',
    plain: "Where the passwords (API keys) for your AI provider live. Keys pasted into code or chat logs are how products get hacked. Unsure? 'CI secret store' is the safe default.",
    widget: {
      kind: 'choice',
      customAllowed: true, customPlaceholder: 'describe your setup',
      options: [
        { value: 'broker', label: 'Secret broker / manager', hint: 'Vault, Doppler, cloud secret manager' },
        { value: 'ci-secrets', label: 'CI secret store only', hint: 'GitHub/GitLab encrypted secrets' },
        { value: 'env', label: '.env files (gitignored)' },
      ],
    },
    defaultAnswer: 'ci-secrets',
    visibleWhen: (a) => a.provider !== 'local',
  },

  // ── Client & team ───────────────────────────────────────────────────
  {
    id: 'clientScope', section: 'Clients & team',
    prompt: 'Who are the clients receiving results?',
    plain: "Multi-client means you serve many companies from one platform, so a mistake can leak one client's data into another's result. Single-organization keeps the data-isolation machinery but drops the cross-client leak tests.",
    widget: {
      kind: 'choice',
      options: [
        { value: 'multi', label: 'Multiple client companies', hint: 'B2B, one platform, many tenants' },
        { value: 'single', label: 'One organization (internal)', hint: 'results for your own company' },
      ],
    },
    defaultAnswer: 'multi',
  },
  {
    id: 'isolationModel', section: 'Clients & team',
    prompt: 'How is client data isolated while agents work?',
    help: 'Becomes the isolation policy and the leak-test design.',
    plain: "How clients' data is kept apart while agents process it. Namespace = labeled sections in one warehouse (standard, cheap). Row-level security = every row carries an owner check. Separate environment = each client gets their own stack (safest, priciest).",
    widget: {
      kind: 'choice',
      customAllowed: true, customPlaceholder: 'describe your isolation',
      options: [
        { value: 'namespace', label: 'Namespace per client' },
        { value: 'rls', label: 'Row-level security' },
        { value: 'separate-env', label: 'Separate environment per client' },
      ],
    },
    defaultAnswer: 'namespace',
    visibleWhen: (a) => a.clientScope === 'multi',
  },
  {
    id: 'retentionOwner', section: 'Clients & team',
    prompt: 'Who executes client data deletion / offboarding?',
    help: 'Agents prepare dry-run plans; a named human pulls the trigger.',
    plain: "When a client leaves or invokes 'right to be forgotten', someone must actually delete their data from every store — including agent audit trails. Agents prepare a dry-run diff; this named human executes it.",
    widget: { kind: 'text', placeholder: 'e.g. platform-oncall@acme.io' },
    defaultAnswer: 'engineering lead',
    visibleWhen: (a) => a.clientScope === 'multi',
  },
  {
    id: 'teamMaturity', section: 'Clients & team',
    prompt: 'How big is the engineering effort?',
    help: 'Sets governance depth: solo conventions, team reviews, or platform scorecards.',
    plain: "How many people keep this honest. Solo = you review everything yourself. Platform = several teams, so the playbook adds scorecards and named control owners.",
    widget: {
      kind: 'choice',
      options: [
        { value: 'solo', label: 'Solo engineer' },
        { value: 'team', label: 'One team' },
        { value: 'platform', label: 'Platform / multi-team' },
      ],
    },
    defaultAnswer: 'team',
  },

  // ── Verification ────────────────────────────────────────────────────
  {
    id: 'outcomeAccuracy', section: 'Verification',
    prompt: 'Minimum verified-correct rate for delivered results?',
    help: 'Merge-blocking gate. Below it, changes do not ship.',
    plain: "The share of delivered results that pass verification. 95% means at most 5 in 100 results are wrong. This is the headline quality gate — every change must prove it doesn't push accuracy below the bar.",
    widget: {
      kind: 'choice',
      customAllowed: true, customPlaceholder: 'e.g. 0.97',
      options: [
        { value: '0.90', label: '≥ 90%', hint: 'early product' },
        { value: '0.95', label: '≥ 95%', hint: 'standard' },
        { value: '0.98', label: '≥ 98%', hint: 'high-stakes outcomes' },
      ],
    },
    defaultAnswer: '0.95',
  },
  {
    id: 'verificationCoverage', section: 'Verification',
    prompt: 'How is every result checked before it counts as delivered?',
    help: 'The playbook makes changing the verifier itself a high-risk change.',
    plain: "A 'verifier' is a checker that inspects each finished result against the acceptance rules. 100% auto-verification plus sampled human audit is the standard pattern — machines check everything, humans check the checker.",
    widget: {
      kind: 'choice',
      customAllowed: true, customPlaceholder: 'describe your verification',
      options: [
        { value: 'auto-plus-sampled-human', label: 'Auto-verifier + sampled human audit', hint: 'recommended' },
        { value: 'auto-only', label: 'Auto-verifier only' },
        { value: 'human-only', label: 'Human reviews every result' },
      ],
    },
    defaultAnswer: 'auto-plus-sampled-human',
  },
  {
    id: 'humanSampleRate', section: 'Verification',
    prompt: 'What share of delivered results do humans audit?',
    plain: "The % of results a human double-checks after autonomous delivery. 10% is a common start — enough to catch the verifier's blind spots. Audited failures feed the gold-standard set used to improve the verifier.",
    widget: {
      kind: 'choice',
      customAllowed: true, customPlaceholder: 'percent',
      options: [
        { value: '5', label: '5%', hint: 'high volume' },
        { value: '10', label: '10%', hint: 'common start' },
        { value: '25', label: '25%', hint: 'high-stakes' },
      ],
    },
    defaultAnswer: '10',
    visibleWhen: (a) => a.verificationCoverage === 'auto-plus-sampled-human',
  },
  {
    id: 'goldSetSize', section: 'Verification',
    prompt: 'How large is the gold-standard set of known-correct results?',
    help: 'Input → expected outcome pairs used to test changes before shipping.',
    plain: "A gold-standard set is an archive of real cases with expert-agreed correct outcomes. Before any change ships, agents re-run these cases; if they produce wrong results, the change fails. Start with 150 and grow it with every real failure you find.",
    widget: {
      kind: 'choice',
      customAllowed: true, customPlaceholder: 'exact number',
      options: [
        { value: '50', label: '50', hint: 'minimum viable' },
        { value: '150', label: '150', hint: 'recommended start' },
        { value: '300', label: '300', hint: 'solid' },
        { value: '500', label: '500', hint: 'mature product' },
      ],
    },
    defaultAnswer: '150',
  },
  {
    id: 'slaTurnaround', section: 'Verification',
    prompt: 'Turnaround SLA per result?',
    help: 'p95 — 95% of results must finish within this time.',
    plain: "How fast customers get their result. p95 means 95 out of 100 results finish within the limit. Missed SLAs often mean penalties in Result-as-a-Service contracts, so the playbook treats SLA regressions like test failures.",
    widget: {
      kind: 'choice',
      customAllowed: true, customPlaceholder: 'e.g. 45m, 6h',
      options: [
        { value: '15m', label: '15 minutes', hint: 'real-time feel' },
        { value: '1h', label: '1 hour' },
        { value: '24h', label: '24 hours', hint: 'batch / daily work' },
      ],
    },
    defaultAnswer: '1h',
  },
  {
    id: 'costPerOutcome', section: 'Verification',
    prompt: 'Allowed cost-per-result increase per change?',
    help: 'Margin protection. CI benchmarks it like a test.',
    plain: "In RaaS your margin is price minus agent cost per result. +5% means no change may make results 5% more expensive to produce without approval — this stops quality theater, where agents quietly do 10× more work for a 1% gain.",
    widget: {
      kind: 'choice',
      customAllowed: true, customPlaceholder: 'percent',
      options: [
        { value: '0', label: '0% — cost-neutral only' },
        { value: '5', label: '+5%', hint: 'standard' },
        { value: '15', label: '+15%', hint: 'quality over margin' },
      ],
    },
    defaultAnswer: '5',
  },

  // ── Side effects ────────────────────────────────────────────────────
  {
    id: 'externalActions', section: 'Side effects',
    prompt: 'Which actions in the outside world may agents take?',
    help: 'Toggle all that apply. Each one adds a control block to the playbook.',
    plain: "Actions that leave your system and touch the real world — sending an email, updating a client's CRM, charging money. The more of these agents do unsupervised, the stronger the audit trail and undo machinery must be.",
    widget: {
      kind: 'toggle',
      options: [
        { value: 'send-comms', label: 'Send communications', hint: 'emails, messages, tickets' },
        { value: 'write-records', label: 'Create / update records', hint: 'in client or internal systems' },
        { value: 'financial', label: 'Financial actions', hint: 'payments, refunds, charges' },
        { value: 'none', label: 'None — artifacts only', hint: 'nothing leaves until a human acts' },
      ],
    },
    defaultAnswer: ['write-records'],
  },
  {
    id: 'sideEffectPolicy', section: 'Side effects',
    prompt: 'How are external actions made safe?',
    help: 'Encoded as hard rules for every agent.',
    plain: "Idempotent = running the same action twice has the same effect as once (safe retries). Audit trail = every action is recorded with who/what/when. Dry-run = the agent first produces a preview diff a human can approve. These stack.",
    widget: {
      kind: 'choice',
      customAllowed: true, customPlaceholder: 'describe your controls',
      options: [
        { value: 'idempotent-audit', label: 'Idempotent + audit trail', hint: 'standard' },
        { value: 'dry-run-first', label: 'Dry-run first, human approves' },
        { value: 'per-action-approval', label: 'Human approval per action', hint: 'slowest, safest' },
      ],
    },
    defaultAnswer: 'idempotent-audit',
  },
  {
    id: 'refundPolicy', section: 'Side effects',
    prompt: 'When a wrong result was delivered and billed, who fixes it?',
    help: 'Credit/refund owner. The playbook adds an incident playbook for wrong-result batches.',
    plain: "Wrong results that were billed are both a quality and a trust incident. Someone must own credits/refunds and the batch assessment: how many affected, which clients, what caused it. Agents assemble the evidence; this role communicates and compensates.",
    widget: { kind: 'text', placeholder: 'e.g. support-lead / automated credits up to $50' },
    defaultAnswer: 'support lead',
  },

  // ── Governance ──────────────────────────────────────────────────────
  {
    id: 'tierHApprovers', section: 'Governance',
    prompt: 'Who are the named approvers for high-risk changes?',
    help: 'E.g. autonomy expansion, pricing changes, verifier swaps.',
    plain: "Some changes are too consequential for one person to approve — like letting agents deliver without human review, or changing what counts as a billable result. These need named senior humans on the hook.",
    widget: { kind: 'text', placeholder: 'e.g. @cto, @head-of-ops' },
    defaultAnswer: '@tech-lead',
  },
  {
    id: 'ciPlatform', section: 'Governance',
    prompt: 'Which CI system should the scaffold target?',
    plain: "The robot that auto-runs your checks when code changes. GitHub Actions if your code lives on GitHub. Have none? The playbook still works — you run 'make check' locally.",
    widget: {
      kind: 'choice',
      customAllowed: true, customPlaceholder: 'e.g. Jenkins',
      options: [
        { value: 'github-actions', label: 'GitHub Actions' },
        { value: 'gitlab-ci', label: 'GitLab CI' },
        { value: 'none', label: 'None yet', hint: 'local `make check` only' },
      ],
    },
    defaultAnswer: 'github-actions',
  },
  {
    id: 'repoSlug', section: 'Governance',
    prompt: 'Repository slug (owner/name)?',
    help: 'Used for CI badge and branch-protection references.',
    plain: "Your repository address, like acme/agents on GitHub. Safe to leave as the default.",
    widget: { kind: 'text', placeholder: 'acme/acme-agents' },
    defaultAnswer: 'owner/raas-product',
    visibleWhen: (a) => a.ciPlatform === 'github-actions' || a.ciPlatform === 'gitlab-ci',
  },
  {
    id: 'worktrees', section: 'Governance',
    prompt: 'Include the git-worktree parallel-agent guide?',
    help: 'One worktree per agent session; race experiments; human merges.',
    plain: "A git worktree is a second, separate copy of the code folder — so two AI agents can work at once without overwriting each other. Say yes if you'll run more than one agent.",
    widget: { kind: 'choice', options: YES_NO },
    defaultAnswer: 'yes',
  },
  {
    id: 'sandboxing', section: 'Governance',
    prompt: 'Include the agent sandboxing guide?',
    plain: "A sandbox is a locked room where the agent runs commands. If it tries something dangerous, the room contains the damage. Recommended for everyone.",
    widget: { kind: 'choice', options: YES_NO },
    defaultAnswer: 'yes',
  },
  {
    id: 'adrs', section: 'Governance',
    prompt: 'Include Architecture Decision Records (ADRs)?',
    plain: "ADR = Architecture Decision Record. A short dated note: what we decided, why, and when to revisit. Six months from now it answers 'wait, why did we set autonomy at this level?'",
    widget: { kind: 'choice', options: YES_NO },
    defaultAnswer: 'yes',
  },
  {
    id: 'securityContact', section: 'Governance',
    prompt: 'Security contact (shown in SECURITY.md and the playbook)?',
    plain: "Where security researchers privately report problems. Use a shared inbox (security@…), not one person's email.",
    widget: { kind: 'text', placeholder: 'security@acme.io' },
    defaultAnswer: 'security@example.com',
    validate: (v) => (typeof v === 'string' && v.trim().length > 0) ? null : 'Provide a contact.',
  },
  {
    id: 'license', section: 'Governance',
    prompt: 'License for the generated project?',
    plain: "How others may legally use your code. Proprietary = private. MIT / Apache-2.0 = public and permissive. Only matters if you publish the repo.",
    widget: {
      kind: 'choice',
      options: [
        { value: 'proprietary', label: 'Proprietary / internal' },
        { value: 'MIT', label: 'MIT' },
        { value: 'Apache-2.0', label: 'Apache-2.0' },
      ],
    },
    defaultAnswer: 'proprietary',
  },
  {
    id: 'extraPractices', section: 'Governance',
    prompt: 'Any extra engineering practices to encode into AGENTS.md?',
    help: 'Free text; appended to the working rules. Leave empty for none.',
    plain: "Any house rules your team already follows — naming, review rules, commit format. They get written into AGENTS.md so every AI agent follows them too. Leave empty if none.",
    widget: { kind: 'text', multiline: true, placeholder: 'e.g. all client-facing comms templates need legal sign-off' },
    defaultAnswer: '',
    optional: true,
  },
]

/** Visible questions in order, given current answers. */
export function visibleQuestions(answers: Record<string, AnswerValue>): Question[] {
  return QUESTIONS.filter((q) => (q.visibleWhen ? q.visibleWhen(answers) : true))
}

export function initialAnswers(): Record<string, AnswerValue> {
  const a: Record<string, AnswerValue> = {}
  for (const q of QUESTIONS) a[q.id] = q.defaultAnswer
  return a
}
