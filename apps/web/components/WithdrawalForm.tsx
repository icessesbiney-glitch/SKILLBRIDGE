import React, { useState, useEffect } from "react";

export default function WithdrawalForm() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState("");
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetch("/api/cashout")
      .then((res) => res.json())
      .then((result) => {
        if (result && result.data) setHistory(result.data);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading("true");
    setMessage("");

    try {
      const res = await fetch("/api/cashout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount })
      });
      const result = await res.json();
      if (result.error) {
        setMessage("? Ledger Error");
      } else {
        setMessage("? Payout Request Submitted Successfully!");
        setAmount("");
      }
    } catch (err) {
      setMessage("? Connection Error");
    } finally {
      setLoading("");
    }
  };

  return (
    <div className="w-full max-w-sm mt-6 flex flex-col gap-6">
      <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm text-left">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Automated Vendor Cashout</h2>
        <p className="text-xs text-gray-500 mb-4">Submit your withdrawal allocation loop request to clear earnings to your mobile money registry.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Cashout Amount ($)</label>
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
            disabled={loading ? true : false}
            className="w-full bg-blue-600 text-white font-bold p-2.5 rounded-lg text-sm transition hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Verifying Balances..." : "Request Instant Withdrawal"}
          </button>
        </form>
        {message ? <p className="text-xs font-medium mt-3 text-center text-gray-700">{message}</p> : null}
      </div>

      <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm text-left">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Recent Withdrawal History Logs</h3>
        {history && history.length > 0 ? (
          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
            {history.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center text-xs p-2 bg-gray-50 border rounded-lg">
                <div>
                  <p className="font-bold text-gray-800">${tx.amount} USD</p>
                </div>
                <span className="px-2 py-0.5 rounded-full font-semibold text-[10px] bg-amber-100 text-amber-700">
                  {tx.status || "pending"}
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
