import Link from "next/link";

const features = [
  ["01", "Learn with direction", "Turn the skills you want into a clear, considered path forward."],
  ["02", "Share what you know", "Make your hard-won knowledge useful to someone taking the next step."],
  ["03", "Grow in good company", "Find people who make the work feel more generous, human, and possible."],
];

export default function HomePage() {
  return (
    <main>
      <header className="site-header">
        <Link className="brand" href="/"><span className="brand-mark">S</span>skillbridge</Link>
        <nav className="header-links">
          <Link href="#approach">Our approach</Link>
          <Link href="/login">Sign in</Link>
          <Link className="btn btn-primary" href="/signup">Join the bridge <span aria-hidden="true">↗</span></Link>
        </nav>
      </header>

      <section className="hero">
        <div>
          <div className="eyebrow">A better way to get better</div>
          <h1>Skills grow faster <span>together.</span></h1>
          <p className="hero-copy">Skillbridge connects curious people with the practical knowledge, honest feedback, and momentum they need to move forward.</p>
          <div className="hero-actions">
            <Link className="btn btn-primary" href="/signup">Start learning <span aria-hidden="true">→</span></Link>
            <Link className="btn btn-light" href="/dashboard">Explore workspace</Link>
          </div>
          <div className="hero-note"><span className="note-dot" /> No noise. Just useful progress.</div>
        </div>
        <div className="visual" aria-label="Skill progress illustration">
          <div className="visual-main"><div className="eyebrow">Your next chapter</div><h2 className="display" style={{ maxWidth: 220, marginTop: 22, fontSize: 32, lineHeight: 1.05 }}>Make room for momentum.</h2></div>
          <div className="progress-card"><small>Weekly progress</small><strong>72%</strong><div className="progress-bar"><i /></div><small style={{ display: "block", marginTop: 9 }}>+12% from last week</small></div>
          <div className="avatar-stack"><b>AM</b><b>JL</b><b>RK</b><span>1,200+ people learning</span></div>
        </div>
      </section>

      <section className="section" id="approach">
        <div className="section-inner">
          <div className="section-heading"><h2>Progress is a shared practice.</h2><p>A calmer, more connected place to build the skills that matter to you.</p></div>
          <div className="feature-grid">{features.map(([number, title, text]) => <article className="feature" key={number}><span className="feature-number">{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
        </div>
      </section>

      <section className="cta"><div><h2>Ready to cross over?</h2><p>Your next useful conversation is waiting.</p></div><Link className="btn btn-light" href="/signup">Create your account <span aria-hidden="true">↗</span></Link></section>
    </main>
  );
}
