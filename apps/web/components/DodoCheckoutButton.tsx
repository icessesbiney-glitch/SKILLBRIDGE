"use client";

import React, { useState } from "react";

// NOTE: This component previously made a direct client-side fetch to Dodo
// Payments with a hardcoded "Bearer" token in the Authorization header. That
// token was committed to git history and must be treated as compromised --
// rotate it in the Dodo Payments dashboard. The checkout request is now
// proxied through a server-side route (/api/checkout) that reads the Dodo
// key from the server-only DODO_API_KEY environment variable, so no secret
// is ever shipped to the browser.
export default function DodoCheckoutButton() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@acme.com",
          name: "Joshua Biney",
          country: "GH",
        }),
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
