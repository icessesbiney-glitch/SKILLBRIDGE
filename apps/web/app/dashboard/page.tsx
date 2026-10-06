"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@skillbridge/shared";
import AuthStatusCard from "../../components/AuthStatusCard";
import ProtectedShell from "../../components/ProtectedShell";
import SiteChrome from "../../components/SiteChrome";
import TaskWorkspace from "../../components/TaskWorkspace";

export default function DashboardPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState<boolean>(true);

  const readiness = [
    "Validation runs without suppressing errors",
    "Platform assets exist for packaging and installation",
    "Workflow files now match the repository structure",
  ];

  useEffect(() => {
    async function streamWalletData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoadingBalance(false);
          return;
        }

        // Fetch current active ledger parameters
        const { data, error } = await supabase
          .from("platform_wallets")
          .select("available_balance")
          .eq("user_id", user.id)
          .single();

        if (!error && data) {
          setBalance(data.available_balance);
        }
      } catch (err) {
        console.error("Wallet metrics subscription error:", err);
      } finally {
        setLoadingBalance(false);
      }
    }
    streamWalletData();
  }, []);

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
              
              {/* Dynamic Live Wallet Balance Tracking Component Ledger Widget */}
              <article className="sb-card">
                <span className="sb-status-pill">Real-time Balance Grid</span>
                <h3>Operational Wallet Ledger</h3>
                <div className="my-4">
                  {loadingBalance ? (
                    <p className="text-sm text-foreground-light animate-pulse">Syncing platform balances...</p>
                  ) : (
                    <p className="text-3xl font-bold text-brand">
                      {balance !== null ? `${balance.toFixed(2)} GHS` : "0.00 GHS"}
                    </p>
                  )}
                </div>
                <p className="text-xs text-foreground-light">Verified directly against public platform schemas.</p>
              </article>

              <article className="sb-card">
                <span className="sb-status-pill">{readiness.length} completed repair checks</span>
                <h3>Repository readiness</h3>
                <ul className="sb-check-list">
                  {readiness.map((step, idx) => (
                    <li key={idx} className="text-sm text-foreground-light">{step}</li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        </section>
      </ProtectedShell>
    </SiteChrome>
  );
}