"use client";

import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function WalletBalanceDisplay() {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadWallet() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (!user) {
          if (active) {
            setErrorMessage("Sign in to view your wallet balance.");
          }
          return;
        }

        const { data: wallet, error: walletError } = await supabase
          .from("user_wallets")
          .select("balance, currency")
          .eq("user_id", user.id)
          .maybeSingle();

        if (walletError) throw walletError;

        if (wallet && wallet.currency !== "GHS") {
          throw new Error("Your wallet currency could not be verified.");
        }

        const currentBalance = wallet ? Number(wallet.balance) : 0;

        if (!Number.isFinite(currentBalance) || currentBalance < 0) {
          throw new Error("The wallet returned an invalid balance.");
        }

        if (active) {
          setBalance(currentBalance);
          setErrorMessage("");
        }
      } catch (error) {
        console.error("Unable to load learner wallet:", error);

        if (active) {
          setBalance(null);
          setErrorMessage(
            "Wallet balance is temporarily unavailable. Please try again later."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadWallet();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="text-sm text-gray-400 animate-pulse">
        Loading wallet balance...
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl shadow-lg text-white max-w-sm">
      <p className="text-xs uppercase tracking-wider text-emerald-100 font-semibold mb-1">
        Available Balance
      </p>

      <h3 className="text-3xl font-extrabold tracking-tight">
        {balance !== null ? `GHS ${balance.toFixed(2)}` : "Unavailable"}
      </h3>

      {errorMessage ? (
        <p role="status" className="mt-3 text-sm text-white">
          {errorMessage}
        </p>
      ) : (
        <div className="mt-4 pt-3 border-t border-emerald-500/30 flex justify-between text-xs text-emerald-100">
          <span>Currency: GHS</span>
          <span className="font-medium">Learner Wallet</span>
        </div>
      )}
    </div>
  );
}
