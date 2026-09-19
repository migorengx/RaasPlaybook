import { describe, it, expect } from 'vitest'
import { QUESTIONS, visibleQuestions, initialAnswers } from './questions'
import { answersToConfig, slug } from '../generator/config'
import { generatePlaybook } from '../generator/template'
import { generateProject } from '../generator/files'

const answers = () => {
  const a = initialAnswers()
  a['productName'] = 'AcmeRAG'
  return a
}

describe('interview dynamics', () => {
  it('has 24 questions, all with defaults and non-empty prompts', () => {
    expect(QUESTIONS.length).toBe(24)
    for (const q of QUESTIONS) {
      expect(q.prompt.length).toBeGreaterThan(5)
      expect(q.defaultAnswer).toBeDefined()
    }
  })
  it('hides tenant questions for internal-rag, shows for raas', () => {
    const internal = answers(); internal['productType'] = 'internal-rag'
    const ids = visibleQuestions(internal).map((q) => q.id)
    expect(ids).not.toContain('isolationModel')
    expect(ids).not.toContain('retentionOwner')
    const raas = visibleQuestions(answers()).map((q) => q.id)
    expect(raas).toContain('isolationModel')
  })
  it('asks key management only when provider is not local', () => {
    const local = answers(); local['provider'] = 'local'
    expect(visibleQuestions(local).map((q) => q.id)).not.toContain('keyManagement')
    const cloud = answers(); cloud['provider'] = 'openai'
    expect(visibleQuestions(cloud).map((q) => q.id)).toContain('keyManagement')
  })
  it('asks repo slug only when a CI platform is chosen', () => {
    const none = answers(); none['ciPlatform'] = 'none'
    expect(visibleQuestions(none).map((q) => q.id)).not.toContain('repoSlug')
  })
  it('asks canary tenant only when canary = yes', () => {
    const no = answers(); no['canary'] = 'no'
    expect(visibleQuestions(no).map((q) => q.id)).not.toContain('canaryTenant')
  })
})

describe('answersToConfig', () => {
  it('maps answers and parses thresholds', () => {
    const c = answersToConfig({ ...answers(), hitRate: '0.92', goldenSetSize: '300' })
    expect(c.productName).toBe('AcmeRAG')
    expect(c.thresholds.hitRateAt5).toBe(0.92)
    expect(c.goldenSetSize).toBe(300)
    expect(c.include.canary).toBe('yes')
  })
  it('slugifies product names', () => {
    expect(slug('Acme RAG!')).toBe('acme-rag')
  })
})

describe('generatePlaybook', () => {
  it('embeds gates, isolation and approvers', () => {
    const c = answersToConfig(answers())
    const md = generatePlaybook(c)
    expect(md).toContain('# The AcmeRAG Agentic Engineering Playbook')
    expect(md).toContain('hit-rate@5 | ≥ 0.85')
    expect(md).toContain('cross-tenant leak')
    expect(md).toContain('@tech-lead')
    expect(md.length).toBeGreaterThan(2500)
  })
  it('switches to scope framing for internal RAG', () => {
    const c = answersToConfig({ ...answers(), productType: 'internal-rag' })
    const md = generatePlaybook(c)
    expect(md).toContain('permission-scope violations')
    expect(md).not.toContain('cross-tenant leak')
  })
})

describe('generateProject', () => {
  it('emits the core boilerplate set', () => {
    const files = generateProject(answersToConfig(answers()))
    const paths = files.map((f) => f.path)
    for (const p of [
      'README.md', 'AGENTS.md', 'CLAUDE.md', 'CONTRIBUTING.md', 'SECURITY.md',
      'CODEOWNERS', 'Makefile', '.gitignore',
      'docs/PLAYBOOK.md', 'docs/ARCHITECTURE.md', 'docs/EVIDENCE.md', 'docs/SOURCES.md',
      'docs/memory/next-steps.md', 'evals/golden/README.md', 'tests/isolation/README.md',
      '.github/PULL_REQUEST_TEMPLATE.md', '.github/ISSUE_TEMPLATE/agent-task.md',
      '.github/workflows/ci.yml', 'scripts/bootstrap',
    ]) expect(paths).toContain(p)
  })
  it('respects conditional sections', () => {
    const a = answers()
    const withAll = generateProject(answersToConfig(a))
    expect(withAll.map((f) => f.path)).toContain('docs/WORKTREES.md')
    const bare = { ...a, worktrees: 'no', sandboxing: 'no', adrs: 'no', ciPlatform: 'none' }
    const paths = generateProject(answersToConfig(bare)).map((f) => f.path)
    expect(paths).not.toContain('docs/WORKTREES.md')
    expect(paths).not.toContain('docs/SANDBOXING.md')
    expect(paths).not.toContain('docs/adr/0000-adr-template.md')
    expect(paths).not.toContain('.github/workflows/ci.yml')
  })
  it('uses gitlab ci file when gitlab chosen', () => {
    const a = { ...answers(), ciPlatform: 'gitlab-ci' }
    const paths = generateProject(answersToConfig(a)).map((f) => f.path)
    expect(paths).toContain('.gitlab-ci.yml')
    expect(paths).not.toContain('.github/workflows/ci.yml')
  })
  it('AGENTS.md embeds custom practices and approvers', () => {
    const a = { ...answers(), extraPractices: 'All API changes need an OpenAPI diff.', tierHApprovers: '@cto' }
    const agents = generateProject(answersToConfig(a)).find((f) => f.path === 'AGENTS.md')!
    expect(agents.content).toContain('All API changes need an OpenAPI diff.')
    expect(agents.content).toContain('@cto')
  })
})

describe('optional questions', () => {
  it('extraPractices is optional; Next is never blocked by it', () => {
    const q = QUESTIONS.find((x) => x.id === 'extraPractices')!
    expect(q.optional).toBe(true)
    const required = QUESTIONS.filter((x) => !x.optional)
    for (const x of required) expect(String(initialAnswers()[x.id]).trim()).not.toBe('')
  })
})

describe('newbie explanations', () => {
  it('every question carries a plain-language explanation', () => {
    for (const q of QUESTIONS) {
      expect(q.plain, `missing plain for ${q.id}`).toBeTruthy()
      expect(q.plain.length, `plain too short for ${q.id}`).toBeGreaterThan(40)
    }
  })
})
