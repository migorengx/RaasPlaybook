import { describe, it, expect } from 'vitest'
import { generatePlaybook } from './template'
import { defaultConfig } from './config'

describe('generatePlaybook', () => {
  it('produces a non-empty markdown document with the product name', () => {
    const md = generatePlaybook(defaultConfig)
    expect(md).toContain('# The MyRaaS Agentic Engineering Playbook')
    expect(md.length).toBeGreaterThan(4000)
  })

  it('interpolates thresholds into quality gates', () => {
    const md = generatePlaybook({
      ...defaultConfig,
      thresholds: { ...defaultConfig.thresholds, hitRateAt5: 0.91, faithfulness: 0.95 },
    })
    expect(md).toContain('hit-rate@5 | ≥ 0.91')
    expect(md).toContain('faithfulness | ≥ 0.95')
  })

  it('adds tenant isolation for multi-tenant RaaS', () => {
    const md = generatePlaybook(defaultConfig) // raas
    expect(md).toContain('cross-tenant leak')
    expect(md).toContain('Tenant isolation is a hard wall')
  })

  it('uses permission-scope framing for internal RAG', () => {
    const md = generatePlaybook({ ...defaultConfig, productType: 'internal-rag' })
    expect(md).toContain('permission-scope violations')
    expect(md).not.toContain('cross-tenant leak')
  })

  it('adds platform governance for platform maturity, solo mode for solo', () => {
    expect(generatePlaybook({ ...defaultConfig, teamMaturity: 'platform' }))
      .toContain('Platform governance')
    expect(generatePlaybook({ ...defaultConfig, teamMaturity: 'solo' }))
      .toContain('Solo mode')
    expect(generatePlaybook({ ...defaultConfig, teamMaturity: 'team' }))
      .not.toContain('Solo mode')
  })

  it('omits optional sections when disabled', () => {
    const md = generatePlaybook({
      ...defaultConfig,
      include: { worktrees: false, sandboxing: false, adrs: false, canary: false },
    })
    expect(md).not.toContain('## 8. Worktrees')
    expect(md).not.toContain('## 9. Sandboxing')
    expect(md).not.toContain('Decision records')
  })

  it('includes the security contact', () => {
    const md = generatePlaybook({ ...defaultConfig, securityContact: 'sec@acme.io' })
    expect(md).toContain('sec@acme.io')
  })
})
