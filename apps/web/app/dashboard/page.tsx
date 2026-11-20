"use client";

import Link from "next/link";
import ProtectedShell from "../../components/ProtectedShell";
import SiteChrome from "../../components/SiteChrome";
import WalletBalanceDisplay from "../../components/WalletBalanceDisplay";
import PaystackCheckoutButton from "../../components/PaystackCheckoutButton";
import WithdrawalForm from "../../components/WithdrawalForm";

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
              <PaystackCheckoutButton />
              <WithdrawalForm />
              <article className="sb-card">
                <span className="sb-status-pill">Marketplace</span>
                <h2>Browse available work</h2>
                <p>Browse current marketplace opportunities and submit work from your account.</p>
                <Link href="/tasks" className="sb-button">Browse work</Link>
              </article>
            </div>
          </div>
        </section>
      </ProtectedShell>
    </SiteChrome>
  );
}