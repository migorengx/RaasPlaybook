import { useMemo, useState } from 'react'
import { marked } from 'marked'
import { generatePlaybook } from './generator'
import { defaultConfig, type PlaybookConfig } from './generator'

/** Escape user-supplied strings so they can't inject HTML into the preview. */
const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const sanitize = (c: PlaybookConfig): PlaybookConfig => ({
  ...c,
  productName: esc(c.productName.trim() || 'MyRaaS').slice(0, 60),
  securityContact: esc(c.securityContact.trim() || 'security@example.com').slice(0, 120),
})

export default function App() {
  const [config, setConfig] = useState<PlaybookConfig>(defaultConfig)
  const [copied, setCopied] = useState(false)

  const markdown = useMemo(() => generatePlaybook(sanitize(config)), [config])
  const html = useMemo(() => marked.parse(markdown, { async: false }) as string, [markdown])
  const words = markdown.split(/\s+/).length

  const download = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${sanitize(config).productName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-agentic-playbook.md`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const copy = async () => {
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const set = <K extends keyof PlaybookConfig>(k: K, v: PlaybookConfig[K]) =>
    setConfig((c) => ({ ...c, [k]: v }))

  const setT = (k: keyof PlaybookConfig['thresholds'], v: number) =>
    setConfig((c) => ({ ...c, thresholds: { ...c.thresholds, [k]: v } }))

  const setI = (k: keyof PlaybookConfig['include'], v: boolean) =>
    setConfig((c) => ({ ...c, include: { ...c.include, [k]: v } }))

  return (
    <div className="app">
      <header className="hero">
        <div className="badge">raas-agentic-playbook</div>
        <h1>Generate your team's<br /><span>agentic engineering playbook</span></h1>
        <p className="sub">
          Answer six questions. Get a complete, customized playbook for building
          RAG products with AI agents — eval gates, change tiers, isolation
          policy, evidence ladders. Download it as Markdown and drop it in your repo.
        </p>
      </header>

      <main className="generator">
        <aside className="panel form">
          <h2>Configure</h2>

          <label>Product name
            <input value={config.productName} maxLength={60}
              onChange={(e) => set('productName', e.target.value)} />
          </label>

          <label>Product type
            <select value={config.productType}
              onChange={(e) => set('productType', e.target.value as PlaybookConfig['productType'])}>
              <option value="raas">RAG-as-a-Service (multi-tenant)</option>
              <option value="internal-rag">Internal RAG</option>
              <option value="chatbot">Customer-facing chatbot</option>
            </select>
          </label>

          <label>LLM provider
            <select value={config.provider}
              onChange={(e) => set('provider', e.target.value as PlaybookConfig['provider'])}>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="local">Local / self-hosted</option>
              <option value="mixed">Mixed providers</option>
            </select>
          </label>

          <label>Team maturity
            <select value={config.teamMaturity}
              onChange={(e) => set('teamMaturity', e.target.value as PlaybookConfig['teamMaturity'])}>
              <option value="solo">Solo engineer</option>
              <option value="team">Team</option>
              <option value="platform">Platform / multi-team</option>
            </select>
          </label>

          <fieldset>
            <legend>Quality gates</legend>
            <label className="num">Hit-rate@5 ≥
              <input type="number" step="0.01" min="0.5" max="1" value={config.thresholds.hitRateAt5}
                onChange={(e) => setT('hitRateAt5', Number(e.target.value))} />
            </label>
            <label className="num">Faithfulness ≥
              <input type="number" step="0.01" min="0.5" max="1" value={config.thresholds.faithfulness}
                onChange={(e) => setT('faithfulness', Number(e.target.value))} />
            </label>
            <label className="num">Hallucination ≤ %
              <input type="number" step="0.5" min="0" max="20" value={config.thresholds.hallucinationMax}
                onChange={(e) => setT('hallucinationMax', Number(e.target.value))} />
            </label>
            <label className="num">p95 latency ≤ ms
              <input type="number" step="50" min="50" max="5000" value={config.thresholds.latencyP95Ms}
                onChange={(e) => setT('latencyP95Ms', Number(e.target.value))} />
            </label>
            <label className="num">Cost delta ≤ %
              <input type="number" step="1" min="0" max="100" value={config.thresholds.costDeltaMaxPct}
                onChange={(e) => setT('costDeltaMaxPct', Number(e.target.value))} />
            </label>
          </fieldset>

          <fieldset>
            <legend>Include sections</legend>
            <label className="check"><input type="checkbox" checked={config.include.worktrees}
              onChange={(e) => setI('worktrees', e.target.checked)} /> Worktrees & parallel agents</label>
            <label className="check"><input type="checkbox" checked={config.include.sandboxing}
              onChange={(e) => setI('sandboxing', e.target.checked)} /> Sandboxing</label>
            <label className="check"><input type="checkbox" checked={config.include.canary}
              onChange={(e) => setI('canary', e.target.checked)} /> Canary rollout gate</label>
            <label className="check"><input type="checkbox" checked={config.include.adrs}
              onChange={(e) => setI('adrs', e.target.checked)} /> Decision records (ADR)</label>
          </fieldset>

          <label>Security contact
            <input value={config.securityContact}
              onChange={(e) => set('securityContact', e.target.value)} />
          </label>

          <div className="actions">
            <button className="primary" onClick={download}>Download .md</button>
            <button onClick={copy}>{copied ? 'Copied ✓' : 'Copy markdown'}</button>
          </div>
        </aside>

        <section className="panel preview">
          <div className="preview-head">
            <h2>Live preview</h2>
            <span className="meta">{words.toLocaleString()} words · updates as you configure</span>
          </div>
          <article className="md" dangerouslySetInnerHTML={{ __html: html }} />
        </section>
      </main>

      <footer>
        <p>
          Built on the{' '}
          <a href="https://www.agenticamit.com/resources/agentic-engineering-playbook" target="_blank" rel="noreferrer">
            Agentic Engineering Playbook</a>{' '}
          · worktree/sandbox practice from Mike McQuaid & Claude Code docs ·
          <a href="https://github.com/"> source repo</a>
        </p>
      </footer>
    </div>
  )
}
