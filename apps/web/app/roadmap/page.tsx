import SiteChrome from '../../components/SiteChrome';
import AuthStatusCard from '../../components/AuthStatusCard';
import { courseRoadmap, mentorGuidance } from '../../data/siteContent';

export default function RoadmapPage() {
  return (
    <SiteChrome>
      <section className="sb-section">
        <div className="sb-container">
          <div className="sb-section-heading">
            <div>
              <span className="sb-eyebrow">One course roadmap</span>
              <h1>Run the whole project from one roadmap.</h1>
            </div>
            <p>
              This page turns the repository into one delivery roadmap across web, mobile, desktop, and deployment operations.
            </p>
          </div>

          <div className="sb-card-grid sb-card-grid-compact">
            {courseRoadmap.map((item, index) => (
              <article key={item.title} className="sb-card">
                <div className="sb-roadmap-index">0{index + 1}</div>
                <h2>{item.title}</h2>
                <p>{item.summary}</p>
                <ul className="sb-simple-list">
                  {item.outcomes.map((outcome) => (
                    <li key={outcome}>{outcome}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sb-section sb-section-alt">
        <div className="sb-container sb-split">
          <div className="sb-panel">
            <span className="sb-eyebrow">Mentor guidance</span>
            <h2>Feedback on what to do next</h2>
            <div className="sb-stack">
              {mentorGuidance.map((item) => (
                <article key={item.title} className="sb-step-card">
                  <div>
                    <h3>{item.title}</h3>
                    <p className="sb-muted">{item.summary}</p>
                  </div>
                  <ul className="sb-simple-list">
                    {item.actions.map((action) => (
                      <li key={action}>{action}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>

          <AuthStatusCard />
        </div>
      </section>
    </SiteChrome>
  );
}
