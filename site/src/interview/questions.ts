/**
 * Interview schema — dynamic, one-question-at-a-time wizard.
 * Every question: default answer + preset options + optional custom answer.
 * Visibility of later questions depends on earlier answers.
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
  widget: Widget
  defaultAnswer: AnswerValue
  /** Optional questions may be left empty. */
  optional?: boolean
  /** Return false to skip this question given earlier answers. */
  visibleWhen?: (a: Record<string, AnswerValue>) => boolean
  validate?: (v: AnswerValue) => string | null
}

const YES_NO: QuestionOption[] = [
  { value: 'yes', label: 'Yes', hint: 'include it' },
  { value: 'no', label: 'No', hint: 'skip it' },
]

export const QUESTIONS: Question[] = [
  // ── Product ────────────────────────────────────────────────────────────
  {
    id: 'productName', section: 'Product',
    prompt: 'What is your product called?',
    help: 'Used in titles, file headers, and CI job names.',
    widget: { kind: 'text', placeholder: 'AcmeRAG' },
    defaultAnswer: 'MyRaaS',
    validate: (v) => (typeof v === 'string' && v.trim().length > 0 ? null : 'A name is required.'),
  },
  {
    id: 'productType', section: 'Product',
    prompt: 'What are you building?',
    help: 'Determines the isolation policy and risk framing of the playbook.',
    widget: {
      kind: 'choice',
      options: [
        { value: 'raas', label: 'RAG-as-a-Service', hint: 'multi-tenant product, tenants are customers' },
        { value: 'internal-rag', label: 'Internal RAG', hint: 'one organization, internal users' },
        { value: 'chatbot', label: 'Customer-facing chatbot', hint: 'retrieval-grounded assistant' },
      ],
    },
    defaultAnswer: 'raas',
  },
  {
    id: 'provider', section: 'Product',
    prompt: 'Which LLM provider(s) does the product use?',
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
    id: 'keyManagement', section: 'Product',
    prompt: 'How do agents and CI get provider credentials?',
    help: 'The playbook encodes this into its secrets policy.',
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

  // ── Team ───────────────────────────────────────────────────────────────
  {
    id: 'teamMaturity', section: 'Team',
    prompt: 'How big is the engineering effort?',
    help: 'Sets governance depth: solo conventions, team reviews, or platform scorecards.',
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
  {
    id: 'ciPlatform', section: 'Team',
    prompt: 'Which CI system should the scaffold target?',
    widget: {
      kind: 'choice',
      customAllowed: true, customPlaceholder: 'e.g. Jenkins',
      options: [
        { value: 'github-actions', label: 'GitHub Actions' },
        { value: 'gitlab-ci', label: 'GitLab CI' },
        { value: 'none', label: 'None yet', hint: 'scaffold ships local `make check` only' },
      ],
    },
    defaultAnswer: 'github-actions',
  },
  {
    id: 'repoSlug', section: 'Team',
    prompt: 'Repository slug (owner/name)?',
    help: 'Used for CI badge and branch-protection references.',
    widget: { kind: 'text', placeholder: 'acme/acme-rag' },
    defaultAnswer: 'owner/rag-product',
    visibleWhen: (a) => a.ciPlatform === 'github-actions' || a.ciPlatform === 'gitlab-ci',
  },

  // ── Quality gates (from playbook §2) ───────────────────────────────────
  {
    id: 'goldenSetSize', section: 'Quality gates',
    prompt: 'How large should the initial golden eval set be?',
    help: 'Q/A pairs per user type. Playbook recommends 100–500.',
    widget: {
      kind: 'choice',
      customAllowed: true, customPlaceholder: 'exact number',
      options: [
        { value: '50', label: '50', hint: 'minimum viable, expand later' },
        { value: '150', label: '150', hint: 'recommended start' },
        { value: '300', label: '300', hint: 'solid' },
        { value: '500', label: '500', hint: 'mature product' },
      ],
    },
    defaultAnswer: '150',
  },
  {
    id: 'hitRate', section: 'Quality gates',
    prompt: 'Minimum hit-rate@5 for merge?',
    help: 'Share of eval questions where a relevant chunk lands in top-5.',
    widget: {
      kind: 'choice',
      customAllowed: true, customPlaceholder: 'e.g. 0.88',
      options: [
        { value: '0.80', label: '≥ 0.80', hint: 'lenient start' },
        { value: '0.85', label: '≥ 0.85', hint: 'playbook default' },
        { value: '0.90', label: '≥ 0.90', hint: 'strict' },
      ],
    },
    defaultAnswer: '0.85',
  },
  {
    id: 'faithfulness', section: 'Quality gates',
    prompt: 'Minimum faithfulness score for merge?',
    help: 'Answers must be grounded in retrieved chunks.',
    widget: {
      kind: 'choice',
      customAllowed: true, customPlaceholder: 'e.g. 0.93',
      options: [
        { value: '0.85', label: '≥ 0.85' },
        { value: '0.90', label: '≥ 0.90', hint: 'playbook default' },
        { value: '0.95', label: '≥ 0.95', hint: 'regulated / high-stakes' },
      ],
    },
    defaultAnswer: '0.90',
  },
  {
    id: 'hallucinationMax', section: 'Quality gates',
    prompt: 'Maximum tolerated hallucination rate?',
    widget: {
      kind: 'choice',
      customAllowed: true, customPlaceholder: 'e.g. 1.5',
      options: [
        { value: '1', label: '≤ 1%', hint: 'strict' },
        { value: '2', label: '≤ 2%', hint: 'playbook default' },
        { value: '5', label: '≤ 5%', hint: 'early product' },
      ],
    },
    defaultAnswer: '2',
  },
  {
    id: 'latencyP95', section: 'Quality gates',
    prompt: 'p95 latency budget per query?',
    widget: {
      kind: 'choice',
      customAllowed: true, customPlaceholder: 'milliseconds',
      options: [
        { value: '200', label: '200 ms', hint: 'snappy' },
        { value: '300', label: '300 ms', hint: 'playbook default' },
        { value: '1000', label: '1 s', hint: 'quality-first' },
      ],
    },
    defaultAnswer: '300',
  },
  {
    id: 'costDelta', section: 'Quality gates',
    prompt: 'Allowed cost-per-query increase per change?',
    widget: {
      kind: 'choice',
      customAllowed: true, customPlaceholder: 'percent',
      options: [
        { value: '0', label: '0% — cost-neutral only' },
        { value: '5', label: '+5%', hint: 'playbook default' },
        { value: '15', label: '+15%', hint: 'quality over cost' },
      ],
    },
    defaultAnswer: '5',
  },

  // ── Isolation (dynamic on product type) ───────────────────────────────
  {
    id: 'isolationModel', section: 'Isolation',
    prompt: 'How is tenant data isolated in retrieval?',
    help: 'Becomes the hard-wall policy and leak-test design in the playbook.',
    widget: {
      kind: 'choice',
      customAllowed: true, customPlaceholder: 'describe your isolation',
      options: [
        { value: 'namespace', label: 'Namespace per tenant', hint: 'shared index, filtered namespaces' },
        { value: 'rls', label: 'Row-level security', hint: 'shared index, RLS predicates' },
        { value: 'separate-index', label: 'Separate index per tenant', hint: 'strongest, costliest' },
      ],
    },
    defaultAnswer: 'namespace',
    visibleWhen: (a) => a.productType === 'raas',
  },
  {
    id: 'retentionOwner', section: 'Isolation',
    prompt: 'Who owns tenant deletion / offboarding (GDPR etc.)?',
    help: 'The playbook requires: agents prepare dry-run diffs, this role executes.',
    widget: { kind: 'text', placeholder: 'e.g. platform-oncall@acme.io' },
    defaultAnswer: 'engineering lead',
    visibleWhen: (a) => a.productType === 'raas',
  },

  // ── Practices ──────────────────────────────────────────────────────────
  {
    id: 'worktrees', section: 'Practices',
    prompt: 'Include the git-worktree parallel-agent guide?',
    help: 'One worktree per agent session; race experiments; human merges.',
    widget: { kind: 'choice', options: YES_NO },
    defaultAnswer: 'yes',
  },
  {
    id: 'sandboxing', section: 'Practices',
    prompt: 'Include the agent sandboxing guide?',
    widget: { kind: 'choice', options: YES_NO },
    defaultAnswer: 'yes',
  },
  {
    id: 'canary', section: 'Practices',
    prompt: 'Gate tier-H changes behind a canary rollout?',
    help: 'Stage quality-affecting changes to an internal tenant first.',
    widget: { kind: 'choice', options: YES_NO },
    defaultAnswer: 'yes',
  },
  {
    id: 'canaryTenant', section: 'Practices',
    prompt: 'What is the canary tenant called?',
    widget: { kind: 'text', placeholder: 'e.g. internal-dogfood' },
    defaultAnswer: 'dogfood',
    visibleWhen: (a) => a.canary === 'yes',
  },
  {
    id: 'adrs', section: 'Practices',
    prompt: 'Include Architecture Decision Records (ADRs)?',
    help: 'Durable choices (model swaps, chunking strategy) get numbered records.',
    widget: { kind: 'choice', options: YES_NO },
    defaultAnswer: 'yes',
  },
  {
    id: 'extraPractices', section: 'Practices',
    prompt: 'Any extra engineering practices to encode into AGENTS.md?',
    help: 'Free text; appended to the working rules. Leave empty for none.',
    widget: { kind: 'text', multiline: true, placeholder: 'e.g. all API changes need an OpenAPI diff; conventional commits enforced by CI' },
    defaultAnswer: '',
    optional: true,
  },

  // ── Governance ─────────────────────────────────────────────────────────
  {
    id: 'tierHApprovers', section: 'Governance',
    prompt: 'Who are the named approvers for high-risk (tier-H) changes?',
    help: 'Comma-separated. E.g. embedding swap, chunking strategy, retention.',
    widget: { kind: 'text', placeholder: 'e.g. @cto, @ml-lead' },
    defaultAnswer: '@tech-lead',
  },
  {
    id: 'securityContact', section: 'Governance',
    prompt: 'Security contact (shown in SECURITY.md and the playbook)?',
    widget: { kind: 'text', placeholder: 'security@acme.io' },
    defaultAnswer: 'security@example.com',
    validate: (v) => (typeof v === 'string' && (v.includes('@') || v.startsWith('http') || v.trim().length > 0)) ? null : 'Provide an email or URL.',
  },
  {
    id: 'license', section: 'Governance',
    prompt: 'License for the generated project?',
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
