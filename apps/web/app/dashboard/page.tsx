import Link from 'next/link';

import AuthStatusCard from '../../components/AuthStatusCard';
import ProtectedShell from '../../components/ProtectedShell';
import SiteChrome from '../../components/SiteChrome';
import TaskWorkspace from '../../components/TaskWorkspace';
import { deploymentSteps, platforms, teamMembers } from '../../data/siteContent';

export default function DashboardPage() {
  const readiness = [
    'Validation runs without suppressing errors',
    'Platform assets exist for packaging and installation',
    'Workflow files now match the repository structure',
  ];

  return (
    <SiteChrome>
      <ProtectedShell
        title="Protected operations dashboard"
        description="Sign in to view the task workspace, learner earnings path, and team operations pages."
      >
        <section className="sb-section">
          <div className="sb-container">
            <div className="sb-section-heading">
              <div>
                <span className="sb-eyebrow">Operations dashboard</span>
                <h1>Repository status and deployment readiness</h1>
              </div>
              <p>
                This page combines protected operations access with learner tasks, earning growth, and deployment visibility.
              </p>
            </div>

            <div className="sb-card-grid sb-card-grid-compact">
              <AuthStatusCard />
              <article className="sb-card">
                <span className="sb-status-pill">{readiness.length} completed repair checks</span>
                <h3>Repository readiness</h3>
                <ul className="sb-check-list">
                  {readiness.map((item) => (
                    <li key={item} className="is-ready">
                      <span>Ready</span>
                      <strong>{item}</strong>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="sb-card">
                <span className="sb-status-pill">3 active repair lanes</span>
                <h3>Immediate priorities</h3>
                <ul className="sb-simple-list">
                  <li>Finish replacing mocked auth and placeholder data with live flows.</li>
                  <li>Connect GitHub secrets so web, mobile, and desktop workflows can ship.</li>
                  <li>Keep validation strict so broken changes cannot deploy silently.</li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section className="sb-section sb-section-alt">
          <div className="sb-container">
            <TaskWorkspace />
          </div>
        </section>

        <section className="sb-section">
          <div className="sb-container">
            <div className="sb-section-heading">
              <div>
                <span className="sb-eyebrow">Linked applications</span>
                <h2>Each platform is tracked inside the same operational view.</h2>
              </div>
              <p>Use this as the handoff page when deciding what still needs finishing before release.</p>
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

        <section className="sb-section">
          <div className="sb-container sb-split">
            <div className="sb-panel">
              <span className="sb-eyebrow">Team alignment</span>
              <h2>Owners for the work that remains</h2>
              <div className="sb-stack">
                {teamMembers.map((member) => (
                  <article key={member.name} className="sb-member-row">
                    <div>
                      <h3>{member.name}</h3>
                      <p className="sb-muted">{member.role}</p>
                    </div>
                    <p>{member.focus}</p>
                  </article>
                ))}
              </div>
              <div className="sb-actions">
                <Link href="/team" className="sb-button">
                  Open team page
                </Link>
                <Link href="/roadmap" className="sb-button-secondary">
                  Open roadmap
                </Link>
              </div>
            </div>

            <div className="sb-panel">
              <span className="sb-eyebrow">Deployment sequence</span>
              <h2>What must happen before direct deployment works</h2>
              <div className="sb-stack">
                {deploymentSteps.map((step, index) => (
                  <article key={step.title} className="sb-step-card">
                    <div className="sb-roadmap-index">0{index + 1}</div>
                    <div>
                      <h3>{step.title}</h3>
                      <p>{step.detail}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </ProtectedShell>
    </SiteChrome>
  );
}
