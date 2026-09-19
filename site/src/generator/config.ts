import type { AnswerValue } from '../interview/questions'

export type ProductType = 'raas' | 'internal-rag' | 'chatbot'
export type Maturity = 'solo' | 'team' | 'platform'
export type YesNo = 'yes' | 'no'

/** Fully-typed project configuration derived from interview answers. */
export interface ProjectConfig {
  productName: string
  productType: ProductType
  provider: string            // option value or custom text
  keyManagement: string
  teamMaturity: Maturity
  ciPlatform: string
  repoSlug: string
  goldenSetSize: number
  thresholds: {
    hitRateAt5: number
    faithfulness: number
    hallucinationMax: number
    latencyP95Ms: number
    costDeltaMaxPct: number
  }
  isolationModel: string      // 'namespace' | 'rls' | 'separate-index' | custom
  retentionOwner: string
  include: { worktrees: YesNo; sandboxing: YesNo; canary: YesNo; adrs: YesNo }
  canaryTenant: string
  extraPractices: string
  tierHApprovers: string
  securityContact: string
  license: string
}

const s = (a: Record<string, AnswerValue>, k: string, dflt = '') =>
  typeof a[k] === 'string' ? (a[k] as string) : dflt
const n = (a: Record<string, AnswerValue>, k: string, dflt: number) => {
  const v = Number(a[k])
  return Number.isFinite(v) ? v : dflt
}

export function answersToConfig(a: Record<string, AnswerValue>): ProjectConfig {
  return {
    productName: s(a, 'productName', 'MyRaaS').trim() || 'MyRaaS',
    productType: (s(a, 'productType', 'raas')) as ProductType,
    provider: s(a, 'provider', 'mixed'),
    keyManagement: s(a, 'keyManagement', 'ci-secrets'),
    teamMaturity: (s(a, 'teamMaturity', 'team')) as Maturity,
    ciPlatform: s(a, 'ciPlatform', 'github-actions'),
    repoSlug: s(a, 'repoSlug', 'owner/rag-product'),
    goldenSetSize: n(a, 'goldenSetSize', 150),
    thresholds: {
      hitRateAt5: n(a, 'hitRate', 0.85),
      faithfulness: n(a, 'faithfulness', 0.9),
      hallucinationMax: n(a, 'hallucinationMax', 2),
      latencyP95Ms: n(a, 'latencyP95', 300),
      costDeltaMaxPct: n(a, 'costDelta', 5),
    },
    isolationModel: s(a, 'isolationModel', 'namespace'),
    retentionOwner: s(a, 'retentionOwner', 'engineering lead'),
    include: {
      worktrees: (s(a, 'worktrees', 'yes')) as YesNo,
      sandboxing: (s(a, 'sandboxing', 'yes')) as YesNo,
      canary: (s(a, 'canary', 'yes')) as YesNo,
      adrs: (s(a, 'adrs', 'yes')) as YesNo,
    },
    canaryTenant: s(a, 'canaryTenant', 'dogfood'),
    extraPractices: s(a, 'extraPractices', '').trim(),
    tierHApprovers: s(a, 'tierHApprovers', '@tech-lead'),
    securityContact: s(a, 'securityContact', 'security@example.com'),
    license: s(a, 'license', 'proprietary'),
  }
}

export const PRODUCT_TYPE_LABEL: Record<ProductType, string> = {
  raas: 'RAG-as-a-Service (multi-tenant product)',
  'internal-rag': 'Internal RAG (one organization, internal users)',
  chatbot: 'Customer-facing chatbot (retrieval-grounded)',
}

export const ISOLATION_LABEL: Record<string, string> = {
  namespace: 'namespace per tenant (shared index, filtered namespaces)',
  rls: 'row-level security (shared index, RLS predicates)',
  'separate-index': 'separate index per tenant (strongest, costliest)',
}

export const KEYMGMT_LABEL: Record<string, string> = {
  broker: 'secret broker / manager (Vault, Doppler, cloud)',
  'ci-secrets': 'CI secret store only (GitHub/GitLab encrypted secrets)',
  env: '.env files, gitignored, copied via .worktreeinclude',
}

/** kebab/snug file name from product name. */
export const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'raas'
