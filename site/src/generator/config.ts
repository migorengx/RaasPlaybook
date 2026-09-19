export interface PlaybookConfig {
  productName: string
  productType: 'raas' | 'internal-rag' | 'chatbot'
  provider: 'openai' | 'anthropic' | 'local' | 'mixed'
  teamMaturity: 'solo' | 'team' | 'platform'
  thresholds: {
    hitRateAt5: number      // e.g. 0.85
    faithfulness: number    // e.g. 0.90
    hallucinationMax: number// e.g. 2 (%)
    latencyP95Ms: number    // e.g. 300
    costDeltaMaxPct: number // e.g. 5 (%)
  }
  include: {
    worktrees: boolean
    sandboxing: boolean
    adrs: boolean
    canary: boolean
  }
  securityContact: string
}

export const defaultConfig: PlaybookConfig = {
  productName: 'MyRaaS',
  productType: 'raas',
  provider: 'mixed',
  teamMaturity: 'team',
  thresholds: {
    hitRateAt5: 0.85,
    faithfulness: 0.90,
    hallucinationMax: 2,
    latencyP95Ms: 300,
    costDeltaMaxPct: 5,
  },
  include: { worktrees: true, sandboxing: true, adrs: true, canary: true },
  securityContact: 'security@example.com',
}

export const PRODUCT_TYPE_LABEL: Record<PlaybookConfig['productType'], string> = {
  raas: 'RAG-as-a-Service (multi-tenant product)',
  'internal-rag': 'Internal RAG (one company, internal users)',
  chatbot: 'Customer-facing chatbot (retrieval-grounded)',
}
