"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";

export default function WalletBalanceDisplay() {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function streamWalletMetrics() {
      if (!supabase) {
        setError("Wallet services are not configured.");
        setLoading(false);
        return;
      }

      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!user) {
          setError("Sign in to view your wallet balance.");
          return;
        }
        const { data, error: walletError } = await supabase
          .from("platform_wallets")
          .select("balance_cents")
          .eq("profile_id", user.id)
          .single();
        if (walletError) throw walletError;
        setBalance(data.balance_cents / 100);
      } catch (walletError) {
        console.error("Wallet balance request failed:", walletError);
        setError("We could not load your wallet balance.");
      } finally {
        setLoading(false);
      }
    }
    void streamWalletMetrics();
  }, []);

  if (loading) return <div className="text-sm text-gray-400 animate-pulse">Loading wallet balance...</div>;
  if (error) return <p role="status" className="text-sm text-gray-400">{error}</p>;

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