"use client";

import React, { useState, useEffect } from "react";

export default function WithdrawalForm() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<any[]>([]);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/cashout");
      const result = await res.json();
      if (result.data) setHistory(result.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Points straight into your local server router to eliminate all browser fetch exceptions
      const res = await fetch("/api/cashout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount })
      });

      const result = await res.json();

      if (result.error) {
        setMessage(`? Ledger Error: ${result.error}`);
      } else {
        setMessage("? Payout Request Submitted! Balance deducted atomically.");
        setAmount("");
        fetchHistory();
      }
    } catch (err: any) {
      setMessage(`? Connection Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mt-6 flex flex-col gap-6">
      <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm text-left">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Automated Vendor Cashout</h2>
        <p className="text-xs text-gray-500 mb-4">Submit your withdrawal allocation loop request to clear earnings to your mobile money registry.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Cashout Amount (\$)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter value (e.g. 50.00)"
              required
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold p-2.5 rounded-lg text-sm transition hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Verifying Balances..." : "Request Instant Withdrawal"}
          </button>
        </form>
        {message && <p className="text-xs font-medium mt-3 text-center text-gray-700">{message}</p>}
      </div>

      <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm text-left">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Recent Withdrawal History Logs</h3>
        {history.length > 0 ? (
          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
            {history.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center text-xs p-2 bg-gray-50 border rounded-lg">
                <div>
                  <p className="font-bold text-gray-800">\${parseFloat(tx.amount).toFixed(2)} USD</p>
                  <p className="text-[10px] text-gray-400">{new Date(tx.created_at).toLocaleTimeString()}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] \${
                  tx.status === "completed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                }\`}>
                  {tx.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 text-center py-4 border border-dashed rounded-lg">No past transaction rows recorded.</p>
        )}
      </div>
    </div>
  );
}
