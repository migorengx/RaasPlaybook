import type { AnswerValue } from '../interview/questions'

export type YesNo = 'yes' | 'no'
export type Maturity = 'solo' | 'team' | 'platform'

/** Fully-typed project configuration derived from interview answers. */
export interface ProjectConfig {
  productName: string
  outcomeType: string          // resolution | document | transaction | dataset | custom
  deliveryMode: string         // artifact | client-system | communications | human-relay
  autonomyLevel: string        // draft-only | sampled | full
  pricingModel: string         // per-result | tiered | subscription-sla | prepaid-credits
  billingIntegration: string   // auto-api | metered-platform | manual-invoice
  provider: string
  keyManagement: string
  clientScope: 'multi' | 'single'
  isolationModel: string
  retentionOwner: string
  teamMaturity: Maturity
  outcomeAccuracy: number      // 0..1
  verificationCoverage: string // auto-plus-sampled-human | auto-only | human-only
  humanSampleRate: number      // %
  goldSetSize: number
  slaTurnaround: string        // '15m' | '1h' | '24h' | custom
  costPerOutcome: number       // %
  externalActions: string[]    // send-comms | write-records | financial | none
  sideEffectPolicy: string     // idempotent-audit | dry-run-first | per-action-approval
  refundOwner: string
  tierHApprovers: string
  ciPlatform: string
  repoSlug: string
  include: { worktrees: YesNo; sandboxing: YesNo; adrs: YesNo }
  securityContact: string
  license: string
  extraPractices: string
}

const s = (a: Record<string, AnswerValue>, k: string, dflt = '') =>
  typeof a[k] === 'string' ? (a[k] as string) : dflt
const n = (a: Record<string, AnswerValue>, k: string, dflt: number) => {
  const v = Number(a[k])
  return Number.isFinite(v) ? v : dflt
}
const arr = (a: Record<string, AnswerValue>, k: string): string[] =>
  Array.isArray(a[k]) ? (a[k] as string[]) : []

export function answersToConfig(a: Record<string, AnswerValue>): ProjectConfig {
  const external = arr(a, 'externalActions').filter((x) => x !== 'none')
  return {
    productName: s(a, 'productName', 'MyRaaS').trim() || 'MyRaaS',
    outcomeType: s(a, 'outcomeType', 'resolution'),
    deliveryMode: s(a, 'deliveryMode', 'artifact'),
    autonomyLevel: s(a, 'autonomyLevel', 'sampled'),
    pricingModel: s(a, 'pricingModel', 'per-result'),
    billingIntegration: s(a, 'billingIntegration', 'auto-api'),
    provider: s(a, 'provider', 'mixed'),
    keyManagement: s(a, 'keyManagement', 'ci-secrets'),
    clientScope: (s(a, 'clientScope', 'multi') as 'multi' | 'single'),
    isolationModel: s(a, 'isolationModel', 'namespace'),
    retentionOwner: s(a, 'retentionOwner', 'engineering lead'),
    teamMaturity: (s(a, 'teamMaturity', 'team')) as Maturity,
    outcomeAccuracy: n(a, 'outcomeAccuracy', 0.95),
    verificationCoverage: s(a, 'verificationCoverage', 'auto-plus-sampled-human'),
    humanSampleRate: n(a, 'humanSampleRate', 10),
    goldSetSize: n(a, 'goldSetSize', 150),
    slaTurnaround: s(a, 'slaTurnaround', '1h'),
    costPerOutcome: n(a, 'costPerOutcome', 5),
    externalActions: external.length ? external : ['none'],
    sideEffectPolicy: s(a, 'sideEffectPolicy', 'idempotent-audit'),
    refundOwner: s(a, 'refundPolicy', 'support lead'),
    tierHApprovers: s(a, 'tierHApprovers', '@tech-lead'),
    ciPlatform: s(a, 'ciPlatform', 'github-actions'),
    repoSlug: s(a, 'repoSlug', 'owner/raas-product'),
    include: {
      worktrees: (s(a, 'worktrees', 'yes')) as YesNo,
      sandboxing: (s(a, 'sandboxing', 'yes')) as YesNo,
      adrs: (s(a, 'adrs', 'yes')) as YesNo,
    },
    securityContact: s(a, 'securityContact', 'security@example.com'),
    license: s(a, 'license', 'proprietary'),
    extraPractices: s(a, 'extraPractices', '').trim(),
  }
}

export const OUTCOME_LABEL: Record<string, string> = {
  resolution: 'resolved support case',
  document: 'produced document / report',
  transaction: 'completed transaction',
  dataset: 'validated dataset / record set',
}

export const DELIVERY_LABEL: Record<string, string> = {
  artifact: 'downloadable artifact',
  'client-system': 'written into client systems',
  communications: 'sent as communication on client behalf',
  'human-relay': 'reviewed by a human, then relayed',
}

export const AUTONOMY_LABEL: Record<string, string> = {
  'draft-only': 'human approves every result (draft-only)',
  sampled: 'autonomous delivery with sampled human audit',
  full: 'fully autonomous, rollback on incidents',
}

export const PRICING_LABEL: Record<string, string> = {
  'per-result': 'per result',
  tiered: 'tiered / volume pricing',
  'subscription-sla': 'subscription with SLA penalties',
  'prepaid-credits': 'prepaid credits consumed per result',
}

export const BILLING_LABEL: Record<string, string> = {
  'auto-api': 'automated billing API (result event → charge)',
  'metered-platform': 'metered usage platform',
  'manual-invoice': 'manual invoicing, monthly reconciliation',
}

export const KEYMGMT_LABEL: Record<string, string> = {
  broker: 'secret broker / manager (Vault, Doppler, cloud)',
  'ci-secrets': 'CI secret store only (encrypted secrets)',
  env: '.env files, gitignored',
}

export const SIDE_EFFECT_LABEL: Record<string, string> = {
  'idempotent-audit': 'idempotent actions + full audit trail',
  'dry-run-first': 'dry-run preview first, human approves',
  'per-action-approval': 'human approval per single action',
}

export const ACTION_LABEL: Record<string, string> = {
  'send-comms': 'send communications',
  'write-records': 'create / update records in systems',
  financial: 'financial actions (payments, refunds)',
  none: 'no external actions — artifacts only',
}

/** kebab-case file/product slug. */
export const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'raas'
