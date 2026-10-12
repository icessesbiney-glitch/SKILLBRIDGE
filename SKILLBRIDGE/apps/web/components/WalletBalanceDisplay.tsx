"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function WalletBalanceDisplay() {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function streamWalletMetrics() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("platform_wallets").select("balance_cents").eq("profile_id", user.id).single();
      if (data) setBalance(data.balance_cents / 100);
      setLoading(false);
    }
    streamWalletMetrics();
  }, []);

  if (loading) return <div className="text-sm text-gray-400 animate-pulse">Loading wallet balance...</div>;

  return (
    <div className="p-6 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl shadow-lg text-white max-w-sm">
      <p className="text-xs uppercase tracking-wider text-emerald-100 font-semibold mb-1">Available Balance</p>
      <h3 className="text-3xl font-extrabold tracking-tight">
        {balance !== null ? `${balance.toFixed(2)} GHS` : "0.00 GHS"}
      </h3>
      <div className="mt-4 pt-3 border-t border-emerald-500/30 flex justify-between text-xs text-emerald-100">
        <span>Currency: GHS (₵)</span>
        <span className="font-medium">● Live Production Ledger</span>
      </div>
    </div>
  );
}