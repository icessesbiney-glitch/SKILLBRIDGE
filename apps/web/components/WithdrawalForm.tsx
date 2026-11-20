"use client";

import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

interface WithdrawalRow {
  id: string;
  amountGhs: string;
  reference: string;
  status: string;
}

async function authHeaders(): Promise<Record<string, string> | null> {
  if (!supabase) return null;

  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` } : null;
}

export default function WithdrawalForm() {
  const [amount, setAmount] = useState("");
  const [network, setNetwork] = useState("MTN");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [balance, setBalance] = useState<string | null>(null);
  const [history, setHistory] = useState<WithdrawalRow[]>([]);
  const [historyError, setHistoryError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const headers = await authHeaders();
      if (!headers) {
        setHistoryError("Sign in to load wallet activity.");
        return;
      }
      setHistoryError("");
      const res = await fetch("/api/wallet/balance", { headers });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Wallet activity could not be loaded.");
      setBalance(result.wallet.balanceGhs);
      setHistory(result.recentWithdrawals ?? []);
    } catch (error) {
      console.error("Wallet activity request failed:", error);
      setHistoryError(error instanceof Error ? error.message : "Wallet activity could not be loaded.");
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const headers = await authHeaders();
      if (!headers) {
        setMessage("Please sign in to request a cashout.");
        return;
      }
      const res = await fetch("/api/cashout", {
        method: "POST",
        headers,
        body: JSON.stringify({ amount: Number(amount), bankCode: network, accountNumber, accountName }),
      });
      const result = await res.json();
      if (!res.ok || result.error) {
        setMessage(result.error || "Cashout failed.");
      } else {
        setMessage(result.message || "Cashout submitted. Check wallet activity for updates.");
        setAmount("");
        await refresh();
      }
    } catch (error) {
      console.error("Cashout request failed:", error);
      setMessage("We could not confirm the cashout status. Check wallet activity before retrying.");
    } finally {
      setLoading(false);
    }
  };

  const field = "w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black";

  return (
    <div className="w-full max-w-sm mt-6 flex flex-col gap-6">
      <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm text-left">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Cash out to Mobile Money</h2>
        {balance !== null && <p className="text-xs text-gray-500 mb-4">Available balance: GH₵ {balance}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Amount (GH₵, minimum 50)</label>
            <input type="number" min="50" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required className={field} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Network</label>
            <select value={network} onChange={(e) => setNetwork(e.target.value)} className={field}>
              <option value="MTN">MTN MoMo</option>
              <option value="VOD">Telecel Cash</option>
              <option value="ATL">AirtelTigo Money</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Mobile money number</label>
            <input type="tel" autoComplete="tel" maxLength={16} value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} required className={field} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Registered name</label>
            <input type="text" autoComplete="name" maxLength={100} value={accountName} onChange={(e) => setAccountName(e.target.value)} required className={field} />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold p-2.5 rounded-lg text-sm transition hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Processing..." : "Request Cashout"}
          </button>
        </form>
        {message ? <p role="status" className="text-xs font-medium mt-3 text-center text-gray-700">{message}</p> : null}
      </div>

      <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm text-left">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Recent withdrawals</h3>
        {historyError ? (
          <p role="alert" className="text-xs text-red-600">{historyError}</p>
        ) : history.length > 0 ? (
          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
            {history.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center text-xs p-2 bg-gray-50 border rounded-lg">
                <p className="font-bold text-gray-800">GH₵ {tx.amountGhs}</p>
                <span className="px-2 py-0.5 rounded-full font-semibold text-[10px] bg-amber-100 text-amber-700">
                  {tx.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 text-center py-4 border border-dashed rounded-lg">No withdrawals yet.</p>
        )}
      </div>
    </div>
  );
}
