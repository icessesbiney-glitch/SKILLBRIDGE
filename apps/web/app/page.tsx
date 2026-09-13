import Link from 'next/link';

import SiteChrome from '../components/SiteChrome';
import { platforms, roadmap, workstreams } from '../data/siteContent';

export default function HomePage() {
  return (
    <SiteChrome>
      <section className="sb-hero">
        <div className="sb-container sb-hero-grid">
          <div>
            <span className="sb-eyebrow">Repository recovery in progress</span>
            <h1 className="sb-hero-title">Build the full SkillBridge structure without hiding the broken parts.</h1>
            <p className="sb-hero-copy">
              The web experience now highlights project structure, team ownership, and deployment repair so the repository can move toward reliable releases.
            </p>
            <div className="sb-actions">
              <Link href="/roadmap" className="sb-button-secondary">
                Open roadmap
              </Link>
              <Link href="/dashboard" className="sb-button">
                Review operations
              </Link>
              <Link href="/team" className="sb-button sb-button-secondary">
                Review the team
              </Link>
            </div>
          </div>
          <div className="sb-panel">
            <h2>What this rebuild covers</h2>
            <div className="sb-bullet-list">
              {workstreams.map((stream) => (
                <div key={stream.title} className="sb-bullet-card">
                  <h3>{stream.title}</h3>
                  <ul>
                    {stream.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="sb-section">
        <div className="sb-container">
          <div className="sb-section-heading">
            <div>
              <span className="sb-eyebrow">Platform structure</span>
              <h2>Every linked app now has a clearer place in the release flow.</h2>
            </div>
            <p>
              The repository is organised around one web surface, one Electron delivery path, one Expo mobile project, and one shared package.
            </p>
          </div>
          <div className="sb-card-grid">
            {platforms.map((platform) => (
              <article key={platform.name} className="sb-card">
                <span className="sb-status-pill">{platform.status}</span>
                <h3>{platform.name}</h3>
                <p>{platform.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sb-section sb-section-alt">
        <div className="sb-container">
          <div className="sb-section-heading">
            <div>
              <span className="sb-eyebrow">Next sections</span>
              <h2>Continue the unfinished work in a controlled order.</h2>
            </div>
            <p>Finish stability first, then complete features, then turn on automated releases.</p>
          </div>
          <div className="sb-roadmap">
            {roadmap.map((step, index) => (
              <article key={step.phase} className="sb-roadmap-step">
                <div className="sb-roadmap-index">0{index + 1}</div>
                <div>
                  <h3>{step.phase}</h3>
                  <p>{step.summary}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
