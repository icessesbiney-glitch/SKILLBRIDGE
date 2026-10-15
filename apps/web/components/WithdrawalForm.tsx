"use client";

import React, { useState } from "react";

export default function WithdrawalForm() {
  const [amount, setAmount] = useState("");

  return (
    <div className="w-full max-w-sm mt-6 flex flex-col gap-6">
      <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm text-left">
        <h2 className="text-lg font-bold text-gray-900 mb-2">
          Vendor Cashout
        </h2>

        <p className="text-xs text-gray-600 mb-4">
          Paystack withdrawals are temporarily unavailable while secure
          transfer processing is being implemented. No payout will be
          submitted or reported as successful from this screen.
        </p>

        <form
          onSubmit={(event) => {
            event.preventDefault();
          }}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="cashout-amount"
              className="block text-xs font-semibold text-gray-600 mb-1"
            >
              Withdrawal amount (GHS)
            </label>

            <input
              id="cashout-amount"
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Enter amount in GHS"
              disabled
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>

          <button
            type="button"
            disabled
            className="w-full bg-gray-400 text-white font-bold p-2.5 rounded-lg text-sm cursor-not-allowed"
          >
            Withdrawals temporarily unavailable
          </button>

          <p role="status" className="text-xs text-amber-700">
            Your balance will not be debited. Please try again when secure
            Paystack Transfers are enabled.
          </p>
        </form>
      </div>

      <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm text-left">
        <h3 className="text-sm font-bold text-gray-900 mb-3">
          Recent Withdrawal History
        </h3>
        <p className="text-xs text-gray-500 text-center py-4 border border-dashed rounded-lg">
          Withdrawal history is unavailable while payout processing is disabled.
        </p>
      </div>
    </div>
  );
}
