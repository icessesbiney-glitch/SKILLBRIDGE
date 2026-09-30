"use client";

import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder"
);

export default function WithdrawalForm() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Directly records a row in public.withdrawal_requests, firing your automated atomic balance checks
      const { data, error } = await supabase
        .from("withdrawal_requests")
        .insert([{ email: "test@acme.com", amount: parseFloat(amount), status: "pending" }]);

      if (error) {
        setMessage(`? Ledger Error: ${error.message}`);
      } else {
        setMessage("? Payout Request Submitted Successfully! Balance deducted atomically.");
        setAmount("");
      }
    } catch (err: any) {
      setMessage(`? Network Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm text-left max-w-sm w-full mt-6">
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
  );
}
