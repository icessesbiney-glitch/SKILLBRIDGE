"use client";

import Link from "next/link";
import ProtectedShell from "../../components/ProtectedShell";
import SiteChrome from "../../components/SiteChrome";
import WalletBalanceDisplay from "../../components/WalletBalanceDisplay";

export default function DashboardPage() {
  return (
    <SiteChrome>
      <ProtectedShell
        title="Marketplace dashboard"
        description="Manage your marketplace account and wallet."
      >
        <section className="sb-section">
          <div className="sb-container">
            <div className="sb-section-heading">
              <div>
                <span className="sb-eyebrow">Your account</span>
                <h1>Marketplace dashboard</h1>
              </div>
              <p>
                Review your wallet and continue to the marketplace.
              </p>
            </div>

            <div className="sb-card-grid sb-card-grid-compact">
              <WalletBalanceDisplay />
              <article className="sb-card">
                <span className="sb-status-pill">Marketplace</span>
                <h2>Explore available work</h2>
                <p>Browse current marketplace opportunities and submit work from your account.</p>
                <Link href="/tasks" className="sb-button">Browse marketplace</Link>
              </article>
            </div>
          </div>
        </section>
      </ProtectedShell>
    </SiteChrome>
  );
}