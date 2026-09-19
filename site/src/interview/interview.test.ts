import { describe, it, expect } from 'vitest'
import { QUESTIONS, visibleQuestions, initialAnswers } from './questions'
import { answersToConfig, slug } from '../generator/config'
import { generatePlaybook } from '../generator/template'
import { generateProject } from '../generator/files'

const answers = () => {
  const a = initialAnswers()
  a['productName'] = 'AcmeResults'
  return a
}

describe('interview schema (Result-as-a-Service)', () => {
  it('every question has a default, prompt, and plain-language explanation', () => {
    for (const q of QUESTIONS) {
      expect(q.prompt.length).toBeGreaterThan(5)
      expect(q.defaultAnswer).toBeDefined()
      expect(q.plain, `missing plain for ${q.id}`).toBeTruthy()
      expect(q.plain.length, `plain too short for ${q.id}`).toBeGreaterThan(40)
    }
  })
  it('is grounded in outcome/billing vocabulary, not retrieval', () => {
    const text = QUESTIONS.map((q) => [q.prompt, q.help, q.plain].join(' ')).join(' ').toLowerCase()
    expect(text).toContain('result')
    expect(text).toContain('billing')
    expect(text).toContain('autonomy')
    expect(text).not.toContain('hit-rate')
    expect(text).not.toContain('chunking')
    expect(text).not.toContain('faithfulness')
  })
  it('hides client-data questions for single-org, shows for multi-client', () => {
    const single = answers(); single['clientScope'] = 'single'
    const ids = visibleQuestions(single).map((q) => q.id)
    expect(ids).not.toContain('isolationModel')
    expect(ids).not.toContain('retentionOwner')
    expect(visibleQuestions(answers()).map((q) => q.id)).toContain('isolationModel')
  })
  it('asks human sample rate only for auto+sampled verification', () => {
    const autoOnly = answers(); autoOnly['verificationCoverage'] = 'auto-only'
    expect(visibleQuestions(autoOnly).map((q) => q.id)).not.toContain('humanSampleRate')
  })
  it('asks repo slug only when a CI platform is chosen', () => {
    const none = answers(); none['ciPlatform'] = 'none'
    expect(visibleQuestions(none).map((q) => q.id)).not.toContain('repoSlug')
  })
  it('optional questions never block (extraPractices)', () => {
    const q = QUESTIONS.find((x) => x.id === 'extraPractices')!
    expect(q.optional).toBe(true)
  })
})

describe('answersToConfig', () => {
  it('maps outcome fields and toggles', () => {
    const c = answersToConfig({ ...answers(), outcomeAccuracy: '0.98', externalActions: ['send-comms', 'financial'] })
    expect(c.productName).toBe('AcmeResults')
    expect(c.outcomeAccuracy).toBe(0.98)
    expect(c.externalActions).toEqual(['send-comms', 'financial'])
    expect(c.clientScope).toBe('multi')
  })
  it('treats none-only external actions as artifact-only', () => {
    const c = answersToConfig({ ...answers(), externalActions: ['none'] })
    expect(c.externalActions).toEqual(['none'])
  })
  it('slugifies product names', () => {
    expect(slug('Acme Results!')).toBe('acme-results')
  })
})

describe('generatePlaybook (Result-as-a-Service)', () => {
  it('contains the RaaS core: outcome gates, billing integrity, autonomy tiers', () => {
    const md = generatePlaybook(answersToConfig(answers()))
    expect(md).toContain('# The AcmeResults Result-as-a-Service Playbook')
    expect(md).toContain('billing integrity')
    expect(md).toContain('0 mis-billed')
    expect(md).toContain('autonomy expansion')
    expect(md.length).toBeGreaterThan(2500)
  })
  it('adds client isolation sections only for multi-client', () => {
    const multi = generatePlaybook(answersToConfig(answers()))
    expect(multi).toContain('Client data isolation')
    const single = generatePlaybook(answersToConfig({ ...answers(), clientScope: 'single' }))
    expect(single).not.toContain('Client data isolation')
  })
  it('omits side-effect section for artifact-only products', () => {
    const md = generatePlaybook(answersToConfig({ ...answers(), externalActions: ['none'] }))
    expect(md).not.toContain('External actions — hard rules')
  })
})

describe('generateProject (Result-as-a-Service scaffold)', () => {
  it('emits the outcome-delivery boilerplate set', () => {
    const files = generateProject(answersToConfig(answers()))
    const paths = files.map((f) => f.path)
    for (const p of [
      'README.md', 'AGENTS.md', 'CONTRIBUTING.md', 'SECURITY.md', 'CODEOWNERS', 'Makefile',
      'docs/PLAYBOOK.md', 'docs/ARCHITECTURE.md', 'docs/EVIDENCE.md', 'docs/SOURCES.md',
      'docs/memory/next-steps.md',
      'outcomes/README.md', 'outcomes/acceptance/README.md', 'outcomes/gold/README.md',
      'billing/README.md', 'tests/isolation/README.md',
      '.github/PULL_REQUEST_TEMPLATE.md', '.github/ISSUE_TEMPLATE/agent-task.md',
      '.github/workflows/ci.yml', 'scripts/bootstrap',
    ]) expect(paths, `missing ${p}`).toContain(p)
  })
  it('AGENTS.md forbids billing unverified results and embeds custom practices', () => {
    const a = { ...answers(), extraPractices: 'Client comms templates need legal sign-off.' }
    const agents = generateProject(answersToConfig(a)).find((f) => f.path === 'AGENTS.md')!
    expect(agents.content).toContain('Never bill an unverified result')
    expect(agents.content).toContain('Client comms templates need legal sign-off.')
  })
  it('respects conditional sections', () => {
    const a = { ...answers(), worktrees: 'no', sandboxing: 'no', adrs: 'no', ciPlatform: 'none' }
    const paths = generateProject(answersToConfig(a)).map((f) => f.path)
    expect(paths).not.toContain('docs/WORKTREES.md')
    expect(paths).not.toContain('docs/SANDBOXING.md')
    expect(paths).not.toContain('docs/adr/0000-adr-template.md')
    expect(paths).not.toContain('.github/workflows/ci.yml')
    const gitlab = { ...answers(), ciPlatform: 'gitlab-ci' }
    const gpaths = generateProject(answersToConfig(gitlab)).map((f) => f.path)
    expect(gpaths).toContain('.gitlab-ci.yml')
  })
})

describe('vocabulary guard (Result-as-a-Service, not RAG)', () => {
  const fs = require('fs')
  const path = require('path')
  const siteRoot = path.resolve(__dirname, '../..')
  const files = [
    'src/App.tsx', 'src/pages/Why.tsx', 'src/interview/questions.ts',
    'src/generator/config.ts', 'src/generator/template.ts', 'src/generator/files.ts',
    'index.html',
  ]
  it('never mentions RAG — the product is Result-as-a-Service', () => {
    for (const rel of files) {
      const text = fs.readFileSync(path.join(siteRoot, rel), 'utf-8')
      expect(text, `${rel} mentions RAG`).not.toMatch(/RAG/)
    }
  })
  it('states the Result-as-a-Service identity in hero and metadata', () => {
    const app = fs.readFileSync(path.join(siteRoot, 'src/App.tsx'), 'utf-8')
    const html = fs.readFileSync(path.join(siteRoot, 'index.html'), 'utf-8')
    expect(app).toMatch(/RaaS product/)
    expect(html).toContain('Result-as-a-Service')
  })
})
