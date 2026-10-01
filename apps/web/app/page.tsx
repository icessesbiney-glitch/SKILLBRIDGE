"use client";
import React, { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) return alert("Please enter a valid amount.");
    setLoading(true);
    try {
      const res = await fetch("/api/paystack-init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(amount), email: "customer@skillbridge.club" }),
      });
      const data = await res.json();
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        alert("Failed to initialize Paystack session.");
      }
    } catch {
      alert("Error reaching checkout servers.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ backgroundColor: "#fff", padding: "32px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0,1)", width: "100%", maxWidth: "400px", textAlign: "center" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "900", color: "#111827", marginBottom: "4px" }}>SkillBridge Core Hub</h1>
        <p style={{ fontSize: "14px", color: "#4b5563", marginBottom: "24px" }}>Live Mobile Money & Card Gateway Node</p>
        <div style={{ backgroundColor: "#f0fdf4", padding: "16px", borderRadius: "12px", border: "1px solid #bbf7d0", marginBottom: "24px" }}>
          <span style={{ fontSize: "12px", fontWeight: "800", color: "#16a34a" }}>GATEWAY STATUS</span>
          <p style={{ fontSize: "18px", fontWeight: "700", color: "#14532d", margin: "4px 0 0" }}>● Operational (Live Mode)</p>
        </div>
        <input type="number" placeholder="Enter Deposit Amount (₵)" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ width: "100%", padding: "12px", borderWidth: "1px", borderColor: "#d1d5db", borderRadius: "8px", marginBottom: "16px", fontSize: "16px", color: "#111" }} />
        <button onClick={handleDeposit} disabled={loading} style={{ width: "100%", backgroundColor: "#3b82f6", color: "#fff", padding: "14px", borderRadius: "8px", fontWeight: "700", border: "none", cursor: "pointer" }}>
          {loading ? "Opening Secure Gateway..." : "Deposit via Mobile Money"}
        </button>
      </div>
    </main>
  );
}
