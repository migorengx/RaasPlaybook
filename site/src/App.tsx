import { useEffect, useMemo, useState } from 'react'
import { marked } from 'marked'
import {
  QUESTIONS, visibleQuestions, initialAnswers,
  type AnswerValue, type Question,
} from './interview/questions'
import { answersToConfig, slug } from './generator'
import { generatePlaybook } from './generator'
import { generateProject, buildZipBlob, type GeneratedFile } from './generator'
import Why from './pages/Why'

type Answers = Record<string, AnswerValue>
type Phase = 'interview' | 'review' | 'output'
type Route = '#/' | '#/why'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function useRoute(): [Route, (r: Route) => void] {
  const [route, setRoute] = useState<Route>((window.location.hash as Route) || '#/')
  useEffect(() => {
    const fn = () => setRoute((window.location.hash as Route) || '#/')
    window.addEventListener('hashchange', fn)
    return () => window.removeEventListener('hashchange', fn)
  }, [])
  const nav = (r: Route) => { window.location.hash = r }
  return [route, nav]
}

export default function App() {
  const [route, nav] = useRoute()
  const [beginner, setBeginner] = useState(true)
  const [answers, setAnswers] = useState<Answers>(initialAnswers)
  const [phase, setPhase] = useState<Phase>('interview')
  const [step, setStep] = useState(0)
  const [customMode, setCustomMode] = useState(false)
  const [copied, setCopied] = useState(false)
  const [packing, setPacking] = useState(false)
  const [selectedFile, setSelectedFile] = useState(0)
  const [zipInfo, setZipInfo] = useState<{ blob: Blob; files: GeneratedFile[] } | null>(null)

  const visible = useMemo(() => visibleQuestions(answers), [answers])
  const q: Question | undefined = visible[Math.min(step, visible.length - 1)]
  const progress = phase === 'interview' ? Math.round((step / visible.length) * 100) : 100
  const config = useMemo(() => answersToConfig(answers), [answers])

  const setAnswer = (id: string, v: AnswerValue) => setAnswers((a) => ({ ...a, [id]: v }))
  const reset = () => { setAnswers(initialAnswers()); setStep(0); setPhase('interview'); setSelectedFile(0); setZipInfo(null) }

  const isAnswered = (qq: Question) => {
    if (qq.optional) return true
    const v = answers[qq.id]
    return qq.widget.kind === 'toggle' ? (v as string[]).length > 0 : String(v ?? '').trim() !== ''
  }
  const error = q && !isAnswered(q) ? 'An answer is required.' : q?.validate ? q.validate(answers[q.id]) : null

  const next = () => {
    if (error) return
    setCustomMode(false)
    if (step + 1 >= visible.length) setPhase('review')
    else setStep(step + 1)
  }
  const back = () => { setCustomMode(false); if (step > 0) setStep(step - 1) }

  const playbookMd = useMemo(() => generatePlaybook(config), [config])
  const projectFiles = useMemo(() => generateProject(config), [config])

  const downloadZip = async () => {
    setPacking(true)
    try {
      const { blob } = await buildZipBlob(config)
      setZipInfo({ blob, files: projectFiles })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `${slug(config.productName)}-agentic-boilerplate.zip`
      a.click()
      URL.revokeObjectURL(a.href)
    } finally { setPacking(false) }
  }
  const downloadFile = (content: string, name: string) => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([content], { type: 'text/markdown;charset=utf-8' }))
    a.download = name
    a.click()
    URL.revokeObjectURL(a.href)
  }

  // ── question widget ─────────────────────────────────────────────
  const renderWidget = (qq: Question) => {
    const v = answers[qq.id]
    const w = qq.widget
    if (w.kind === 'text') {
      return (
        <textarea
          className={w.multiline ? 'ta tall' : 'ta'}
          placeholder={w.placeholder}
          value={String(v ?? '')}
          onChange={(e) => setAnswer(qq.id, e.target.value)}
          rows={w.multiline ? 3 : 1}
        />
      )
    }
    if (w.kind === 'toggle') {
      const arr = v as string[]
      return (
        <div className="opts">
          {w.options.map((o) => (
            <label key={o.value} className={`opt ${arr.includes(o.value) ? 'on' : ''}`}>
              <input type="checkbox" checked={arr.includes(o.value)}
                onChange={(e) => setAnswer(qq.id, e.target.checked ? [...arr, o.value] : arr.filter((x) => x !== o.value))} />
              <span>{o.label}{o.hint && <small> — {o.hint}</small>}</span>
            </label>
          ))}
        </div>
      )
    }
    const isCustom = !w.options.some((o) => o.value === v)
    return (
      <div className="opts">
        {w.options.map((o) => (
          <label key={o.value} className={`opt ${v === o.value && !customMode ? 'on' : ''}`}>
            <input type="radio" name={qq.id} checked={v === o.value && !customMode}
              onChange={() => { setCustomMode(false); setAnswer(qq.id, o.value) }} />
            <span><b>{o.label}</b>{o.hint && <small> — {o.hint}</small>}</span>
          </label>
        ))}
        {w.customAllowed && (
          <div className={`opt custom ${customMode || isCustom ? 'on' : ''}`}>
            <label className="custom-head">
              <input type="radio" name={qq.id} checked={customMode || isCustom} onChange={() => setCustomMode(true)} />
              <b>Custom…</b>
            </label>
            {(customMode || isCustom) && (
              <input className="custom-input" autoFocus placeholder={w.customPlaceholder ?? 'your answer'}
                value={isCustom ? String(v) : ''}
                onChange={(e) => setAnswer(qq.id, esc(e.target.value))} />
            )}
          </div>
        )}
      </div>
    )
  }

  const sections = [...new Set(QUESTIONS.map((x) => x.section))]

  return (
    <div className="app">
      <header className="topbar">
        <a className="mark" href="#/" onClick={() => nav('#/')}>
          <span className="mark-no">R-A-G</span>
          <span className="mark-name">agentic-playbook</span>
          <span className="mark-tag">SPEC·01</span>
        </a>
        <nav>
          <a className={route === '#/why' ? 'on' : ''} href="#/why" onClick={() => nav('#/why')}>Why this matters</a>
          <a className={route === '#/' ? 'on' : ''} href="#/" onClick={() => nav('#/')}>The interview</a>
        </nav>
      </header>

      {route === '#/why' ? (
        <Why onStart={() => { reset(); nav('#/') }} />
      ) : (
        <>
          {phase === 'interview' && (
            <header className="hero">
              <div className="kicker">RESULT-AS-A-SERVICE · INTERVIEW · {QUESTIONS.length} QUESTIONS · ~6 MIN</div>
              <h1>Your RAG product's<br />engineering playbook, on record</h1>
              <p className="sub">
                Answer with defaults if you're in a hurry — every question explains
                itself. You leave with a playbook document and a working repo scaffold:
                agent rules, outcome gates wired to your numbers, billing-integrity and
                isolation tests, PR templates.
              </p>
              <label className="beginner">
                <input type="checkbox" checked={beginner} onChange={(e) => setBeginner(e.target.checked)} />
                Explain every question in plain terms
              </label>
            </header>
          )}

          {phase === 'interview' && q && (
            <main className="wizard">
              <div className="progress" role="progressbar" aria-valuenow={progress}>
                <div className="bar" style={{ width: `${progress}%` }} />
              </div>
              <div className="meta-row">
                <span className="meta">{String(visible.indexOf(q) + 1).padStart(2, '0')} / {String(visible.length).padStart(2, '0')} — {q.section.toUpperCase()}</span>
                <span className="meta">{progress}%</span>
              </div>
              <section className="panel qcard">
                <h2>{q.prompt}</h2>
                {q.help && <p className="help">{q.help}</p>}
                {beginner && q.plain && (
                  <div className="plain">
                    <div className="plain-tag">In plain terms</div>
                    {q.plain}
                  </div>
                )}
                {renderWidget(q)}
                {error && <p className="error">{error}</p>}
                <div className="actions">
                  <button className="btn" onClick={back} disabled={step === 0}>Back</button>
                  <button className="btn ink" onClick={next} disabled={!!error}>
                    {step + 1 >= visible.length ? 'Review answers' : 'Next'}
                  </button>
                </div>
              </section>
              <p className="meta center">Defaults are prefilled — a fast run is just: Next, Next, Next.</p>
            </main>
          )}

          {phase === 'review' && (
            <main className="wizard">
              <section className="panel">
                <h2 className="rev-title">On record — review before generating</h2>
                {sections.map((sec) => {
                  const qs = visible.filter((x) => x.section === sec)
                  if (!qs.length) return null
                  return (
                    <div key={sec} className="rev-sec">
                      <h3>{sec}</h3>
                      {qs.map((qq) => {
                        const v = answers[qq.id]
                        const label = Array.isArray(v) ? v.join(', ') : String(v)
                        const idx = visible.findIndex((x) => x.id === qq.id)
                        return (
                          <button key={qq.id} className="rev-row" onClick={() => { setStep(idx); setPhase('interview') }}>
                            <span className="q">{qq.prompt}</span>
                            <span className="a">{label || '—'} <i>edit</i></span>
                          </button>
                        )
                      })}
                    </div>
                  )
                })}
                <div className="actions">
                  <button className="btn" onClick={() => setPhase('interview')}>Keep editing</button>
                  <button className="btn ink" onClick={async () => {
                    setPacking(true)
                    const { blob } = await buildZipBlob(config)
                    setZipInfo({ blob, files: projectFiles })
                    setPacking(false)
                    setPhase('output')
                  }} disabled={packing}>{packing ? 'Packing…' : 'Generate project'}</button>
                </div>
              </section>
            </main>
          )}

          {phase === 'output' && (
            <main className="output">
              <section className="panel out-actions">
                <div className="kicker">OUTPUT · SIGNED {new Date().toISOString().slice(0, 10)}</div>
                <h2>The {config.productName} package</h2>
                <p className="help">{projectFiles.length} files — playbook + repo scaffold wired to your gates.</p>
                <div className="actions">
                  <button className="btn ink" onClick={downloadZip} disabled={packing}>
                    {packing ? 'Packing…' : 'Download boilerplate ZIP'}
                  </button>
                  <button className="btn" onClick={() => downloadFile(playbookMd, `${slug(config.productName)}-playbook.md`)}>
                    Playbook .md only
                  </button>
                </div>
                {zipInfo && <p className="meta">ZIP packed — {(zipInfo.blob.size / 1024).toFixed(1)} KB, {zipInfo.files.length} files.</p>}
                <div className="actions" style={{ marginTop: 12 }}>
                  <button className="btn" onClick={() => { setPhase('review'); setZipInfo(null) }}>Change answers</button>
                  <button className="btn" onClick={reset}>Start over</button>
                </div>
              </section>

              <section className="panel out-files">
                <div className="preview-head">
                  <h2 className="rev-title">Manifest</h2>
                  <span className="meta">{projectFiles.length} FILES</span>
                </div>
                <div className="file-grid">
                  <ul className="tree">
                    {projectFiles.map((file, i) => (
                      <li key={file.path}>
                        <button className={`tree-row ${i === selectedFile ? 'on' : ''}`} onClick={() => setSelectedFile(i)}>
                          {file.path}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="file-view">
                    <div className="preview-head">
                      <span className="meta">{projectFiles[selectedFile]?.path}</span>
                      <span>
                        <button className="btn mini" onClick={async () => {
                          await navigator.clipboard.writeText(projectFiles[selectedFile]?.content ?? '')
                          setCopied(true); setTimeout(() => setCopied(false), 1200)
                        }}>{copied ? 'Copied' : 'Copy'}</button>
                        <button className="btn mini" onClick={() => downloadFile(
                          projectFiles[selectedFile]?.content ?? '',
                          projectFiles[selectedFile]?.path.split('/').pop() ?? 'file.md'
                        )}>Save</button>
                      </span>
                    </div>
                    {projectFiles[selectedFile]?.path.endsWith('.md') ? (
                      <article className="md" dangerouslySetInnerHTML={{
                        __html: marked.parse(projectFiles[selectedFile].content, { async: false }) as string,
                      }} />
                    ) : (
                      <pre className="code">{projectFiles[selectedFile]?.content}</pre>
                    )}
                  </div>
                </div>
              </section>
            </main>
          )}
        </>
      )}

      <footer>
        <p>
          Built on the <a href="https://www.agenticamit.com/resources/agentic-engineering-playbook" target="_blank" rel="noreferrer">Agentic Engineering Playbook</a>
          {' '}· worktree &amp; sandbox practice from McQuaid (2026) and Claude Code docs · <a href="#/why" onClick={() => nav('#/why')}>why this matters</a>
        </p>
      </footer>
    </div>
  )
}
