"use client";

import React, { useState } from "react";

export default function DodoCheckoutButton() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://dodopayments.com", {
        method: "POST",
        headers: {
          "Authorization": "Bearer SsmK2WJ71JdsoDyAVDND7K26wWBMly9DPAcQJoTuckwsau1tKnxugbfxjQf",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          product_cart: [{ product_id: "pdt_live_default", quantity: 1 }],
          customer: { email: "test@acme.com", name: "Joshua Biney" },
          billing: { country: "GH" },
          return_url: "https://skillbridge-nine-mu.vercel.app"
        })
      });

      const sessionData = await response.json();
      
      if (sessionData?.checkout_url) {
        window.location.href = sessionData.checkout_url;
      } else {
        alert("Live mode active. Waiting for Dodo compliance approval status to initialize public link.");
      }
    } catch (error) {
      console.error("Checkout link exception:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="w-full max-w-sm px-6 py-3 font-bold text-white bg-blue-600 rounded transition-all hover:bg-blue-700 disabled:bg-gray-400 text-sm"
    >
      {loading ? "Connecting to Payment Gateway..." : "Pay \$400.00 with Dodo Payments"}
    </button>
  );
}
