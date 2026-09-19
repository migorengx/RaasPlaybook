export default function Why({ onStart }: { onStart: () => void }) {
  return (
    <main className="why">
      <header className="why-head">
        <div className="kicker">BRIEF · READ IN 6 MINUTES</div>
        <h1>Why selling results needs<br />an operating system</h1>
        <p className="lede">
          Result-as-a-Service means customers pay for <b>finished outcomes</b> —
          one resolved case, one delivered report — not for software seats. AI
          agents make this model possible. They also make its failure mode new:
          <b> wrong results, delivered fluently, at scale — and billed.</b>
        </p>
      </header>

      <Section n="00" title="The failure nobody logs">
        <p>
          A traditional bug crashes; you find out the same day. An agent that
          produces a plausible-but-wrong result produces no error. The report has
          every section filled. The support case is marked resolved. The invoice
          line reads: 1 result, delivered.
        </p>
        <p>
          Worse: in Result-as-a-Service, billing is wired to delivery. A silent
          quality problem is also a <b>billing problem</b> — you charged for work
          that was wrong. That converts a quality issue into a trust issue with
          your client's finance team.
        </p>
      </Section>

      <Section n="01" title="Agents raise the speed of delivery — verification has to keep up">
        <p>
          AI agents can attempt more results per day than any team could hand-craft.
          That is the entire economic promise of RaaS. But the old rule still holds:
        </p>
        <blockquote>
          An agent increases the rate of attempted change. Engineering has to
          increase the rate of trustworthy feedback. If generation outruns
          verification, the result is faster uncertainty.
          <span className="cite">— The Agentic Engineering Playbook</span>
        </blockquote>
        <p>
          So a RaaS operation is really two pipelines built in parallel: the one
          that produces results, and the one that produces <i>evidence about</i> the
          results. The second one is what most teams forget to build — until a
          client audits them.
        </p>
      </Section>

      <Section n="02" title="What the four gates actually catch">
        <p>Each gate is a tripwire for one specific way result-delivery fails:</p>
        <table>
          <thead><tr><th>Gate</th><th>Catches</th></tr></thead>
          <tbody>
            <tr><td><b>verified-correct rate</b></td><td>"The agent said it was done, but the result is wrong." Every result is checked against acceptance rules before it counts.</td></tr>
            <tr><td><b>billing integrity</b></td><td>"We charged for a result that failed verification." A reconciliation test replays billing and demands: every charge maps to a verified result. Zero mis-billed, hard gate.</td></tr>
            <tr><td><b>client isolation</b></td><td>"Client A's data appeared in client B's result." In a multi-client platform this is a security incident, not a bug.</td></tr>
            <tr><td><b>side-effect audit</b></td><td>"The agent sent that email — but no one can say which result it belonged to, or undo it." Every external action must be logged, tied to a result ID, and idempotent.</td></tr>
          </tbody>
        </table>
        <p>
          None of these can be replaced by "the agent said everything is fine."
          A claim is not evidence. A saved report with pass rates and case IDs is.
        </p>
      </Section>

      <Section n="03" title="Autonomy is the risk dial">
        <p>
          The most consequential setting in a RaaS product is not the model — it is
          <b> how much a human sees each result before the customer does</b>.
          Draft-only is safest and slowest. Fully-autonomous is fastest and needs
          rollback machinery and sampled audits to be safe.
        </p>
        <p>
          That is why the playbook makes <b>raising autonomy a named-approver,
          high-risk change</b> — the same tier as changing pricing. Both redefine
          what the company is selling and what can go wrong.
        </p>
      </Section>

      <Section n="04" title="Is this overkill for a small team?">
        <p>
          Honest answer: the research is mixed. A 2025 randomized study (METR)
          found experienced developers were <i>19% slower</i> with early-2025 AI
          tools on their own mature codebases. DORA's 2025 research calls AI an
          <i> amplifier</i> — it makes strong systems stronger and weak systems weaker.
        </p>
        <p>
          The practical conclusion: <b>measure your own delivery, and set a quality
          bar that doesn't depend on anyone's vibes</b> — including the agent's.
          The interview configures exactly that. Solo teams get a lighter version
          of the same discipline.
        </p>
      </Section>

      <Section n="05" title="Where the ideas come from">
        <ul className="srcs">
          <li><a href="https://www.agenticamit.com/resources/agentic-engineering-playbook" target="_blank" rel="noreferrer">The Agentic Engineering Playbook</a> — task contracts, evidence/recovery ladders, risk tiers, anti-pattern catalog.</li>
          <li><a href="https://sierra.ai/blog/outcome-based-pricing-for-ai-agents" target="_blank" rel="noreferrer">Sierra — outcome-based pricing for AI agents</a> and <a href="https://dart.deloitte.com/USDART/home/publications/deloitte/industry/technology/accounting-outcome-based-pricing-agentic-ai" target="_blank" rel="noreferrer">Deloitte on accounting for outcome-based pricing</a> — the business model this playbook protects.</li>
          <li><a href="https://www.withallo.com/blog/raas-is-the-next-evolution-beyond-saas" target="_blank" rel="noreferrer">Results-as-a-Service beyond SaaS</a> — pay-per-outcome, risk on the vendor.</li>
          <li><a href="https://mikemcquaid.com/sandboxed-agent-worktrees-my-coding-and-ai-setup-in-2026/" target="_blank" rel="noreferrer">Mike McQuaid's sandboxed worktree setup</a> · <a href="https://code.claude.com/docs/en/worktrees" target="_blank" rel="noreferrer">Claude Code worktree docs</a> — parallel-agent mechanics.</li>
          <li><a href="https://dora.dev" target="_blank" rel="noreferrer">DORA 2025</a> · <a href="https://metr.org/Early_2025_AI_Experienced_OS_Devs_Study-paper.pdf" target="_blank" rel="noreferrer">METR 2025</a> — the honest evidence.</li>
        </ul>
      </Section>

      <Section n="06" title="What you walk away with">
        <p>
          About twenty-four questions and six minutes. At the end: a customized
          playbook, an <code>AGENTS.md</code> contract, the verified-delivery
          pipeline skeleton (acceptance rules, gold-standard cases, billing
          replay, side-effect audit), CI wiring, and PR templates that make every
          change carry its own evidence.
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
