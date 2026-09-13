import SiteChrome from '../../components/SiteChrome';
import { teamMembers } from '../../data/siteContent';

export default function TeamPage() {
  return (
    <SiteChrome>
      <section className="sb-section">
        <div className="sb-container">
          <div className="sb-section-heading">
            <div>
              <span className="sb-eyebrow">Team structure</span>
              <h1>Finish the project with clear ownership.</h1>
            </div>
            <p>
              The repository now has a dedicated page for delivery roles, responsibilities, and the parts of the product that still need follow-through.
            </p>
          </div>

          <div className="sb-card-grid">
            {teamMembers.map((member) => (
              <article key={member.name} className="sb-card">
                <span className="sb-status-pill">{member.role}</span>
                <h2>{member.name}</h2>
                <p>{member.focus}</p>
              </article>
            ))}
          </div>

          <div className="sb-panel">
            <span className="sb-eyebrow">Working agreement</span>
            <div className="sb-simple-list">
              <p>Use the operations dashboard to confirm what is deployed, what is blocked, and who owns the next release step.</p>
              <p>Keep deployment credentials in GitHub secrets, keep build validation strict, and replace remaining mocks before final production rollout.</p>
            </div>
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
