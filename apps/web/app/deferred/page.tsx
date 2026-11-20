import Link from 'next/link';
import SiteChrome from '../../components/SiteChrome';

export default function DeferredSectorsPage() {
  return (
    <SiteChrome>
      <section className="sb-section">
        <div className="sb-container">
          <div className="sb-panel">
            <span className="sb-eyebrow">Planned for 2029</span>
            <h1>Driver and delivery services are not available yet.</h1>
            <p>
              Driver onboarding, dispatch, delivery tracking, and courier tools are deferred. The current
              SkillBridge launch is focused on customer and vendor marketplace services.
            </p>
            <Link href="/" className="sb-button">
              Return to SkillBridge
            </Link>
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
