export default function Why({ onStart }: { onStart: () => void }) {
  return (
    <main className="why">
      <header className="why-head">
        <div className="kicker">BRIEF · READ IN 6 MINUTES</div>
        <h1>Why RAG products need<br />an operating system</h1>
        <p className="lede">
          AI agents can now build features faster than teams can check them.
          For retrieval products that's dangerous in a specific way:
          <b> failures are silent.</b> This page explains the problem in plain
          words, and what the playbook does about it.
        </p>
      </header>

      <Section n="00" title="The quiet failure">
        <p>
          A traditional bug crashes. A page goes blank, an API returns 500, a test
          goes red. You find out the same day.
        </p>
        <p>
          A RAG bug does the opposite. Someone adjusts the document chunking on
          Friday afternoon. Nothing crashes. Every test still passes. But over the
          next three weeks, answers quietly drift: the system retrieves
          <i> almost</i> the right documents, answers sound confident, and roughly
          one in fifty contains a fact nobody wrote. No error log exists for
          "slightly wrong".
        </p>
        <p>
          Your customers notice before your tests do. That is the failure mode
          this playbook is built for.
        </p>
      </Section>

      <Section n="01" title="Agents raise the speed of change — verification has to keep up">
        <p>
          AI coding agents are genuinely fast now. They can attempt more changes
          in a day than a team used to review in a week. That is the upside.
        </p>
        <p>
          The core mechanism, from the{' '}
          <a href="https://www.agenticamit.com/resources/agentic-engineering-playbook" target="_blank" rel="noreferrer">Agentic Engineering Playbook</a>:
          <blockquote>
            An agent increases the rate of attempted change. Engineering has to
            increase the rate of trustworthy feedback. If generation outruns
            verification, the result is faster uncertainty.
          </blockquote>
        </p>
        <p>
          So the playbook is not "rules for prompts". It is a matching investment
          on the other side of the scale: automatic checks that get <i>faster and
          more trustworthy</i> as the agents get more productive.
        </p>
      </Section>

      <Section n="02" title="What the four gates actually catch">
        <p>Each gate is a tripwire for one specific way RAG products fail:</p>
        <table>
          <thead>
            <tr><th>Gate</th><th>Catches</th></tr>
          </thead>
          <tbody>
            <tr><td><b>hit-rate@5</b></td><td>"The system never found the right document." If the source isn't retrieved, the answer can only be a guess.</td></tr>
            <tr><td><b>faithfulness</b></td><td>"It found the right document and still made it up." Answers must be grounded in what the source actually says.</td></tr>
            <tr><td><b>leak test</b></td><td>"Customer A's documents appeared in customer B's answer." A security incident, not a bug — so it's a hard zero-tolerance gate.</td></tr>
            <tr><td><b>cost &amp; p95 latency</b></td><td>"Quality theater" — paying 3× more and answering 5× slower for a 1% gain nobody measured.</td></tr>
          </tbody>
        </table>
        <p>
          None of these gates can be replaced by "the agent said the tests pass".
          A claim is not evidence. A command, its exit code, and a saved report are.
        </p>
      </Section>

      <Section n="03" title="What stays human">
        <p>
          The playbook is strict about the division of labor, because "the AI
          approved it" is not accountability:
        </p>
        <ul>
          <li>Agents <b>never push</b> to shared branches. Humans review the diff and push.</li>
          <li>Agents <b>never approve</b> high-risk changes — swapping the embedding model can silently change every answer your product gives. Named humans sign those.</li>
          <li>Agents <b>never touch</b> production data or secrets. They rehearse on synthetic copies.</li>
          <li>Deletions (like a customer's "right to be forgotten") are executed by a person, from a dry-run plan.</li>
        </ul>
      </Section>

      <Section n="04" title="Is this overkill for a small team?">
        <p>
          Honest answer: the research is mixed. A 2025 randomized study (METR)
          found experienced open-source developers were <i>19% slower</i> with
          early-2025 AI tools on their own mature codebases. DORA's 2025 research
          says AI is an <i>amplifier</i> — it makes strong teams stronger and weak
          teams weaker.
        </p>
        <p>
          The practical conclusion is not "agents bad" or "agents good". It is:
          <b> measure your own system, and set a quality bar that doesn't depend on
          anyone's vibes</b> — including the agent's. That is what the interview
          configures. Solo teams get a lighter version of the same discipline.
        </p>
      </Section>

      <Section n="05" title="Where the ideas come from">
        <ul className="srcs">
          <li><a href="https://www.agenticamit.com/resources/agentic-engineering-playbook" target="_blank" rel="noreferrer">The Agentic Engineering Playbook</a> — 53 pages, evidence-backed, with a source ledger. Task contracts, evidence/recovery ladders, risk tiers, and the anti-pattern catalog are adapted from there.</li>
          <li><a href="https://mikemcquaid.com/sandboxed-agent-worktrees-my-coding-and-ai-setup-in-2026/" target="_blank" rel="noreferrer">Mike McQuaid's sandboxed worktree setup</a> — one worktree per agent, sandboxed execution, humans review and push.</li>
          <li><a href="https://code.claude.com/docs/en/worktrees" target="_blank" rel="noreferrer">Claude Code worktree docs</a> — the parallel-session mechanics.</li>
          <li><a href="https://dora.dev" target="_blank" rel="noreferrer">DORA 2025</a> and <a href="https://metr.org/Early_2025_AI_Experienced_OS_Devs_Study-paper.pdf" target="_blank" rel="noreferrer">METR 2025</a> — the honest evidence on productivity claims.</li>
        </ul>
      </Section>

      <Section n="06" title="What you walk away with">
        <p>
          Twenty-four questions. About six minutes. At the end you download a ZIP
          containing the customized playbook, an <code>AGENTS.md</code> contract
          for your agents, eval-gate wiring for your CI, the golden-set and
          leak-test skeletons, and the PR templates that make every change carry
          its own evidence.
        </p>
        <button className="cta" onClick={onStart}>Start the interview →</button>
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
