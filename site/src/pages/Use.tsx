export default function Use({ onGenerate }: { onGenerate: () => void }) {
  return (
    <main className="why">
      <header className="why-head">
        <div className="kicker">GUIDE · FROM ZIP TO RUNNING OPERATION</div>
        <h1>You have the package.<br />Now make it run.</h1>
        <p className="lede">
          A playbook you never open is decoration. This page walks the path from
          the downloaded ZIP to an operation where agents deliver results and
          every change carries evidence.
        </p>
      </header>

      <Section n="00" title="This website is itself Result-as-a-Service">
        <p>
          Notice what just happened: your <b>input</b> was 30 answers; the{" "}
          <b>result</b> was a verified package — a playbook and a scaffold built
          from them. You did not buy a tool or read a tutorial; you received a
          finished deliverable. That is the RaaS pattern this whole playbook
          describes, applied to this site.
        </p>
        <p>
          And it holds itself to the same standard: the generator runs its own
          test suite in CI before every publication, and its "acceptance rules"
          include a guard that the output never drifts back to old vocabulary.
          If your package is wrong for your case, that is a defect in the
          result — report it (see §07), the same way your clients should report
          wrong results to you.
        </p>
      </Section>

      <Section n="01" title="First ten minutes">
        <ol className="steps">
          <li><b>Unzip</b> the package and rename the folder to your project.</li>
          <li><b>Make it yours in git:</b>
            <pre className="code">{`git init -b main && git add -A && git commit -m "chore: bootstrap from raas-playbook"
git remote add origin git@github.com:you/your-repo.git
git push -u origin main`}</pre>
          </li>
          <li><b>Run the bootstrap:</b> <code>./scripts/bootstrap</code> — it prints TODOs. Expected: the scaffold is stack-agnostic until you wire it (§02).</li>
          <li><b>Read in this order</b> (30 minutes): <code>README.md</code> → <code>AGENTS.md</code> → <code>docs/PLAYBOOK.md</code> → <code>docs/EVIDENCE.md</code>.</li>
        </ol>
      </Section>

      <Section n="02" title="Wire the gates to your stack (the TODOs are the work)">
        <p>
          The scaffold intentionally ships with <code>TODO</code> markers instead
          of guessing your stack. Here is what each TODO wants:
        </p>
        <table>
          <thead><tr><th>File</th><th>TODO</th><th>Example wiring</th></tr></thead>
          <tbody>
            <tr><td><code>Makefile</code> (lint/typecheck/test)</td><td>real commands</td><td><code>eslint .</code> · <code>tsc --noEmit</code> · <code>vitest run</code></td></tr>
            <tr><td><code>Makefile</code> (gold)</td><td>run gold cases</td><td>a script that replays <code>outcomes/gold/</code> through your agent and scores vs expected outcomes</td></tr>
            <tr><td><code>Makefile</code> (bill-replay)</td><td>reconcile billing</td><td>replay a sandbox period: every charge ↔ one verified result ID</td></tr>
            <tr><td><code>outcomes/acceptance/</code></td><td>define "correct"</td><td>checkable rules per result type (YAML example is inside)</td></tr>
            <tr><td><code>outcomes/gold/</code></td><td>create cases</td><td>50–150 real-shaped inputs with expert-agreed outcomes</td></tr>
            <tr><td><code>.github/workflows/ci.yml</code></td><td>stack setup steps</td><td><code>actions/setup-node</code> / <code>uv</code> / <code>cargo</code> — the gates are already called in order</td></tr>
          </tbody>
        </table>
        <p>
          Rule of thumb: <b>every TODO you wire converts a promise into a gate.</b>
        </p>
      </Section>

      <Section n="03" title="Baseline, then protect">
        <ol className="steps">
          <li><b>Record your baseline:</b> run the gold set and cost/SLA benchmark once; commit the reports into <code>outcomes/reports/</code>. Every future change is measured against this.</li>
          <li><b>Pin what must be reversible:</b> model IDs, prompts, verifier rules in versioned config. Rollback = re-pin; unpinned things cannot roll back.</li>
          <li><b>Protect main:</b> require the CI checks and one CODEOWNERS review before merge. In GitHub: Settings → Branches → Add rule.</li>
        </ol>
      </Section>

      <Section n="04" title="Run your first agent task (the loop)">
        <ol className="steps">
          <li>Open an issue from the <code>agent-task</code> template — fill all 9 contract fields.</li>
          <li>Give the agent an isolated worktree: <code>git worktree add .worktrees/feat-x -b feat/x</code>, then <code>./scripts/bootstrap</code> inside it.</li>
          <li>The agent works, runs <code>make evidence</code>, and updates <code>docs/memory/</code>.</li>
          <li><b>You</b> read the diff and the evidence, then push. Agents never push.</li>
          <li>Clean up: <code>git worktree remove</code>. The memory bank is the next session's starting point.</li>
        </ol>
      </Section>

      <Section n="05" title="The operating rhythm">
        <ul>
          <li><b>Every change:</b> evidence ladder — gold re-run, billing replay, audit — before merge.</li>
          <li><b>Weekly:</b> humans audit the sampled results (your <code>humanSampleRate</code>); every escaped failure becomes a new gold case.</li>
          <li><b>Monthly (platform tier):</b> scorecard — accuracy, billing integrity, escalation rate, cost per result, incidents. Named control owners review.</li>
        </ul>
      </Section>

      <Section n="06" title="When a gate fights you, listen to it">
        <p>
      Sooner or later a gate will block a change you are sure about. That is
      the system working: the doubt you feel is the exact doubt your clients
      would feel. Gates are weakened only through the tier-H path — named
      approvers, written rationale, an ADR. If the gate is genuinely wrong,
      change it <i>through</i> the process, not around it.
        </p>
      </Section>

      <Section n="07" title="This site's own defect path">
        <p>
          Wrong result from the generator? Missing a file your product type
          needs? That is a mis-delivery: open an issue on the{" "}
          <a href="https://github.com/migorengx/RaasPlaybook" target="_blank" rel="noreferrer">RaasPlaybook repository</a>.
          The generator's gold set grows the same way yours should: every real
          failure becomes a case that can never silently regress.
        </p>
        <button className="cta" onClick={onGenerate}>Back to the interview →</button>
      </Section>
    </main>
  )
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="why-sec">
      <div className="sec-no">{n}</div>
      <div className="sec-body">
        <h2>{title}</h2>
        {children}
      </div>
    </section>
  )
}
