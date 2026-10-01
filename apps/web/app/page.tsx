"use client";

import React, { useState } from "react";
import DodoCheckoutButton from "../components/DodoCheckoutButton";
import WithdrawalForm from "../components/WithdrawalForm";

export default function HomePage() {
  const [momoAmount, setMomoAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePaystackMoMo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!momoAmount || parseFloat(momoAmount) <= 0) return;
    setLoading(true);

    try {
      const res = await fetch("/api/paystack-init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: momoAmount })
      });

      const result = await res.json();
      if (result?.data?.authorization_url) {
        window.location.href = result.data.authorization_url;
      } else {
        alert("Failed to initialize mobile money checkout session.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 text-center">
      <div className="max-w-xl w-full bg-white border rounded-2xl p-8 shadow-sm mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">SkillBridge Ecosystem</h1>
        <p className="text-sm text-gray-600 mb-8">Hyperlocal multi-gateway transaction routing interface hub node.</p>

        <div className="flex flex-col gap-4 items-center">
          <div className="w-full border p-4 rounded-xl bg-gray-50 text-left">
            <h3 className="text-xs font-bold uppercase text-gray-400 mb-2 tracking-wider">Debit / Credit Card Gateway</h3>
            <DodoCheckoutButton />
          </div>

          <div className="w-full border p-4 rounded-xl bg-gray-50 text-left">
            <h3 className="text-xs font-bold uppercase text-gray-400 mb-3 tracking-wider">Ghana Mobile Money (MTN, Telecel, AT)</h3>
            <form onSubmit={handlePaystackMoMo} className="flex gap-2">
              <input
                type="number"
                value={momoAmount}
                onChange={(e) => setMomoAmount(e.target.value)}
                placeholder="Amount (GHS ¢)"
                required
                className="flex-1 p-2 border rounded-lg text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-lg text-sm transition disabled:bg-gray-400"
              >
                {loading ? "Loading..." : "Deposit MoMo"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <WithdrawalForm />
    </main>
  );
}
