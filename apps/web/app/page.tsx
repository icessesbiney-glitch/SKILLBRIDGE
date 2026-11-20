import React from 'react';
import GhanaCardOnboardingForm from '../components/GhanaCardOnboardingForm';
import Link from 'next/link';
import SiteChrome from '../components/SiteChrome';

export default function HomePage() {
  return (
    <SiteChrome>
      <section className="sb-section">
        <div className="sb-container">
          <div className="sb-panel">
            <span className="sb-eyebrow">SkillBridge</span>
            <h1>One account for your marketplace activity.</h1>
            <p>
              Manage your account, wallet, and available work from one place.
              Account verification is submitted securely for review.
            </p>
            <div className="sb-session-actions">
              <Link href="/auth?signup=1" className="sb-button">Create an account</Link>
              <Link href="/tasks" className="sb-button-secondary">Browse available work</Link>
            </div>
          </div>
          <GhanaCardOnboardingForm />
        </div>
      </section>
    </SiteChrome>
  );
}
