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
  /** Jargon-free explanation shown in beginner mode. */
  plain: string
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
    plain: 'Just a label. It shows up in document titles and generated files. You can change it later — nothing is locked in.',
    help: 'Used in titles, file headers, and CI job names.',
    widget: { kind: 'text', placeholder: 'AcmeRAG' },
    defaultAnswer: 'MyRaaS',
    validate: (v) => (typeof v === 'string' && v.trim().length > 0 ? null : 'A name is required.'),
  },
  {
    id: 'productType', section: 'Product',
    prompt: 'What are you building?',
    plain: 'Who sees the answers? A multi-tenant product serves many customer companies from one system, so a mistake can leak between customers. Internal RAG is just your coworkers. A public chatbot talks to strangers. The playbook gets stricter as the blast radius grows.',
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
    id: 'keyManagement', section: 'Product',
    prompt: 'How do agents and CI get provider credentials?',
    plain: "Where the passwords (API keys) for your AI provider live. Keys pasted into code or chat logs are how products get hacked. Unsure? 'CI secret store' is the safe default.",
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
    plain: 'How many people keep this honest. Solo = you review everything yourself. Platform = several teams, so the playbook adds scorecards and named owners.',
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
    plain: "The robot that auto-runs your checks when code changes. GitHub Actions if your code lives on GitHub. Have none? The playbook still works — you run 'make check' locally.",
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
    plain: 'Your repository address, like acme/rag-api on GitHub. Used for CI badges. Safe to leave as the default.',
    help: 'Used for CI badge and branch-protection references.',
    widget: { kind: 'text', placeholder: 'acme/acme-rag' },
    defaultAnswer: 'owner/rag-product',
    visibleWhen: (a) => a.ciPlatform === 'github-actions' || a.ciPlatform === 'gitlab-ci',
  },

  // ── Quality gates (from playbook §2) ───────────────────────────────────
  {
    id: 'goldenSetSize', section: 'Quality gates',
    prompt: 'How large should the initial golden eval set be?',
    plain: "A 'golden set' is an exam with known right answers: N questions, each with the correct source document marked. The AI must pass this exam before a change can merge. Start small (150) and grow it with real failures you find.",
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
    plain: 'How often does the correct document chunk appear in the top-5 retrieved results? 0.85 means the right source shows up 85% of the time. If retrieval misses the source, the AI has to invent — so this gate catches problems at the root.',
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
    plain: 'Does the answer stick to what the retrieved documents actually say? 0.90 means 90% of claims are backed by a source. Low faithfulness = the AI makes things up even when it found the right document.',
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
    plain: 'How many answers may contain made-up facts. 2% = at most 2 in 100 answers include an unsupported claim. Legal or medical? Pick 1%.',
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
    plain: 'How many answers may contain made-up facts. 2% = at most 2 in 100 answers include an unsupported claim. Legal or medical? Pick 1%.',
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
    plain: 'How much more expensive per question a change is allowed to be. +5% blocks changes that quietly burn money — like sending huge prompts for a 1% quality gain.',
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
    plain: "How customers' documents are kept apart. Namespace = labeled sections in one warehouse (standard, cheap). Row-level security = every row carries an owner check. Separate index = each customer gets their own warehouse (safest, priciest). This choice becomes your leak-test design.",
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
    plain: "When a customer asks you to delete all their data ('right to be forgotten'), someone must actually run that deletion. Agents prepare a dry-run plan; this named human pulls the trigger.",
    help: 'The playbook requires: agents prepare dry-run diffs, this role executes.',
    widget: { kind: 'text', placeholder: 'e.g. platform-oncall@acme.io' },
    defaultAnswer: 'engineering lead',
    visibleWhen: (a) => a.productType === 'raas',
  },

  // ── Practices ──────────────────────────────────────────────────────────
  {
    id: 'worktrees', section: 'Practices',
    prompt: 'Include the git-worktree parallel-agent guide?',
    plain: "A git worktree is a second, separate copy of the code folder — so two AI agents can work at once without overwriting each other. Say yes if you'll run more than one agent.",
    help: 'One worktree per agent session; race experiments; human merges.',
    widget: { kind: 'choice', options: YES_NO },
    defaultAnswer: 'yes',
  },
  {
    id: 'sandboxing', section: 'Practices',
    prompt: 'Include the agent sandboxing guide?',
    plain: 'A sandbox is a locked room where the agent runs commands. If it tries something dangerous, the room contains the damage. Recommended for everyone.',
    widget: { kind: 'choice', options: YES_NO },
    defaultAnswer: 'yes',
  },
  {
    id: 'canary', section: 'Practices',
    prompt: 'Gate tier-H changes behind a canary rollout?',
    plain: 'Named after the canary in the coal mine. Risky changes roll out to one internal user first, then everyone. It catches disasters before customers do.',
    help: 'Stage quality-affecting changes to an internal tenant first.',
    widget: { kind: 'choice', options: YES_NO },
    defaultAnswer: 'yes',
  },
  {
    id: 'canaryTenant', section: 'Practices',
    prompt: 'What is the canary tenant called?',
    plain: "The internal user that tests risky changes first. Often called 'dogfood' — as in eating your own dog food.",
    widget: { kind: 'text', placeholder: 'e.g. internal-dogfood' },
    defaultAnswer: 'dogfood',
    visibleWhen: (a) => a.canary === 'yes',
  },
  {
    id: 'adrs', section: 'Practices',
    prompt: 'Include Architecture Decision Records (ADRs)?',
    plain: "ADR = Architecture Decision Record. A short dated note: what we decided, why, and when to revisit. Six months from now it answers 'wait, why did we pick this model?'",
    help: 'Durable choices (model swaps, chunking strategy) get numbered records.',
    widget: { kind: 'choice', options: YES_NO },
    defaultAnswer: 'yes',
  },
  {
    id: 'extraPractices', section: 'Practices',
    prompt: 'Any extra engineering practices to encode into AGENTS.md?',
    plain: 'Any house rules your team already follows — naming, review rules, commit format. They get written into AGENTS.md so every AI agent follows them too. Leave empty if none.',
    help: 'Free text; appended to the working rules. Leave empty for none.',
    widget: { kind: 'text', multiline: true, placeholder: 'e.g. all API changes need an OpenAPI diff; conventional commits enforced by CI' },
    defaultAnswer: '',
    optional: true,
  },

  // ── Governance ─────────────────────────────────────────────────────────
  {
    id: 'tierHApprovers', section: 'Governance',
    prompt: 'Who are the named approvers for high-risk (tier-H) changes?',
    plain: 'Some changes are too risky for one person to approve — swapping the embedding model can silently change every answer your product gives. These need named senior humans on the hook.',
    help: 'Comma-separated. E.g. embedding swap, chunking strategy, retention.',
    widget: { kind: 'text', placeholder: 'e.g. @cto, @ml-lead' },
    defaultAnswer: '@tech-lead',
  },
  {
    id: 'securityContact', section: 'Governance',
    prompt: 'Security contact (shown in SECURITY.md and the playbook)?',
    plain: "Where security researchers privately report problems. Use a shared inbox (security@…), not one person's email.",
    widget: { kind: 'text', placeholder: 'security@acme.io' },
    defaultAnswer: 'security@example.com',
    validate: (v) => (typeof v === 'string' && (v.includes('@') || v.startsWith('http') || v.trim().length > 0)) ? null : 'Provide an email or URL.',
  },
  {
    id: 'license', section: 'Governance',
    prompt: 'License for the generated project?',
    plain: 'How others may legally use your code. Proprietary = private. MIT / Apache-2.0 = public and permissive. Only matters if you publish the repo.',
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
