"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://aolfuonsuaeoitumuvqc.supabase.co",
  "sb_publishable_nLN657ZMe6wupW9HNdm6DQ_44_bZOjE"
);

export default function SkillBridgeHub() {
  const [userTier, setUserTier] = useState("Beginner");
  const [amount, setAmount] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function checkTier() {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("account_tier")
        .eq("id", user.id)
        .single();

      if (data?.account_tier) setUserTier(data.account_tier);
    }

    checkTier();
  }, []);

  const handleAction = async () => {
    if (userTier === "Beginner") {
      setMsg("🎉 Access Granted! Task learning modules are 100% FREE for Beginners.");
      return;
    }
    setMsg("Processing Premium verification checkout...");
  };

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif", display: "flex", justifyContent: "center" }}>
      <div style={{ background: "#fff", padding: "32px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", maxWidth: "400px", width: "100%", textAlign: "center", border: "1px solid #e5e7eb" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#111827", margin: "0 0 8px 0" }}>SkillBridge Core Hub</h2>
        <p style={{ fontSize: "14px", color: "#4b5563", margin: "0 0 24px 0" }}>Account Status: <strong style={{ color: userTier === "Beginner" ? "#16a34a" : "#2563eb" }}>{userTier}</strong></p>

        {userTier === "Beginner" ? (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "16px", borderRadius: "12px", marginBottom: "24px" }}>
            <p style={{ color: "#166534", fontSize: "14px", fontWeight: "600", margin: 0 }}>You are on the Free Beginner Tier. Enjoy unlimited basic tasks!</p>
          </div>
        ) : (
          <input
            type="number"
            placeholder="Enter Upgrade Value (₵)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "10px", marginBottom: "16px", boxSizing: "border-box" }}
          />
        )}

        <button onClick={handleAction} style={{ width: "100%", background: "#2563eb", color: "#fff", padding: "14px", border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}>
          {userTier === "Beginner" ? "Launch Learning Tasks" : "Authorize Premium Upgrade"}
        </button>
        {msg && <p style={{ marginTop: "16px", fontSize: "13px", color: "#374151", fontWeight: "600" }}>{msg}</p>}
      </div>
    </div>
  );
}
