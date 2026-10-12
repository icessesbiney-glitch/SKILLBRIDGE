"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

interface WalletData {
  balance_cents: number;
  paystack_recipient_code: string | null;
}

export default function VendorWalletCard({ profileId }: { profileId: string }) {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );

  useEffect(() => {
    async function fetchWalletState() {
      const { data, error } = await supabase
        .from("platform_wallets")
        .select("balance_cents, paystack_recipient_code")
        .eq("profile_id", profileId)
        .maybeSingle();

      if (!error && data) {
        setWallet(data);
      }
      setLoading(false);
    }
    if (profileId) fetchWalletState();
  }, [profileId]);

  if (loading) return <div style={{ padding: "20px", color: "#888" }}>Syncing secure balance configurations...</div>;

  const balanceGHS = wallet ? (wallet.balance_cents / 100).toFixed(2) : "0.00";

  return (
    <div style={{ background: "#0a0a0a", border: "1px solid #222", padding: "24px", borderRadius: "12px", width: "100%", maxWidth: "400px", fontFamily: "system-ui, sans-serif" }}>
      <span style={{ color: "#666", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" }}>Available Vault Balance</span>
      <h1 style={{ color: "#fff", fontSize: "36px", margin: "8px 0 16px 0", fontWeight: "700" }}>
        {balanceGHS} <span style={{ fontSize: "18px", color: "#00c389" }}>GHS</span>
      </h1>
      <div style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "11px", color: wallet?.paystack_recipient_code ? "#00c389" : "#ff9900" }}>
        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: wallet?.paystack_recipient_code ? "#00c389" : "#ff9900" }}></div>
        {wallet?.paystack_recipient_code ? `Paystack Gateway Recipient Synced: ${wallet.paystack_recipient_code}` : "Mobile Money Dispatch Recipient Off-line"}
      </div>
    </div>
  );
}
