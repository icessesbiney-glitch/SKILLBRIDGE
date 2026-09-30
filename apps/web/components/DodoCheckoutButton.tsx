"use client";

import React, { useState } from "react";

export default function DodoCheckoutButton() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      // Calls your Dodo Payments API configuration endpoints to initialize a checkout session link
      const response = await fetch("https://dodopayments.com", {
        method: "POST",
        headers: {
          "Authorization": "Bearer sb_publishable_f21PTSo3zKr1oayFCTTyxA_yn6C7QKo",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          product_cart: [{ product_id: "pdt_e9mUw084cWnu0tz", quantity: 1 }],
          customer: { email: "test@acme.com", name: "Joshua Biney" },
          billing: { country: "GH" },
          return_url: "http://localhost:3000/dashboard"
        })
      });

      const sessionData = await response.json();
      
      if (sessionData?.checkout_url) {
        // Automatically redirects your customer to the secure live payment gateway screen
        window.location.href = sessionData.checkout_url;
      } else {
        alert("Failed to initialize checkout session parameters.");
      }
    } catch (error) {
      console.error("Checkout redirection exception:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="px-6 py-3 font-bold text-white bg-black rounded shadow transition-all hover:bg-gray-800 disabled:bg-gray-400"
    >
      {loading ? "Initializing Secure Checkout..." : "Pay $400.00 with Dodo Payments"}
    </button>
  );
}
