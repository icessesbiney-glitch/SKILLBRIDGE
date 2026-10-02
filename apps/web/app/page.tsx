"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://aolfuonsuaeoitumuvqc.supabase.co", "sb_publishable_nLN657ZMe6wupW9HNdm6DQ_44_bZOjE");

export default function SkillBridgeHub() {
  const [userTier, setUserTier] = useState("Beginner");
  const [bio, setBio] = useState("");
  const [country, setCountry] = useState("GH");
  const [isSaving, setIsSaving] = useState(false);
  const [courses, setCourses] = useState([
    { title: "UX/UI Design Foundations", cat: "UI/UX", lvl: "Beginner", lessons: 24, time: "6 weeks" },
    { title: "Canva Graphics Masterclass", cat: "Graphic Design", lvl: "Beginner", lessons: 12, time: "2 weeks" },
    { title: "Global Freelancing Essentials", cat: "Career Building", lvl: "Beginner", lessons: 10, time: "2 weeks" }
  ]);

  useEffect(() => {
    async function loadUserData() {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      if (!user) return;

      const { data } = await supabase.from("profiles").select("account_tier, bio, country").eq("id", user.id).single();
      if (data) {
        if (data.account_tier) setUserTier(data.account_tier);
        if (data.bio) setBio(data.bio);
        if (data.country) setCountry(data.country);
      }
    }
    loadUserData();
  }, []);

  const saveProfile = async () => {
    setIsSaving(true);
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;
    if (user) {
      await supabase.from("profiles").update({ bio, country }).eq("id", user.id);
      alert("✅ Professional profile secured and saved successfully!");
    }
    setIsSaving(false);
  };

  return (
    <div style={{ padding: "30px", fontFamily: "system-ui, sans-serif", backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      <header style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "900", color: "#111827", margin: "0" }}>SkillBridge Core Engine</h1>
        <p style={{ fontSize: "14px", color: "#6b7280", margin: "4px 0 0 0" }}>Global Portfolio Verification & Learning Ledger</p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", maxWidth: "1000px", margin: "0 auto" }}>
        
        {/* PANEL A: COURSE CATALOG VIEW */}
        <div style={{ background: "#fff", padding: "24px", borderRadius: "16px", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#111827", marginTop: "0", marginBottom: "16px" }}>📚 Free Learning Catalog</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {courses.map((c, i) => (
              <div key={i} style={{ padding: "14px", backgroundColor: "#f3f4f6", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", backgroundColor: "#dbeafe", color: "#2563eb", padding: "4px 8px", borderRadius: "20px" }}>{c.cat}</span>
                  <span style={{ fontSize: "11px", color: "#16a34a", fontWeight: "700" }}>{c.lvl}</span>
                </div>
                <h4 style={{ margin: "8px 0 4px 0", fontSize: "15px", fontWeight: "700", color: "#1f2937" }}>{c.title}</h4>
                <p style={{ margin: "0", fontSize: "12px", color: "#6b7280" }}>{c.lessons} Lessons • {c.time} • <span style={{ color: "#16a34a", fontWeight: "600" }}>100% Free</span></p>
              </div>
            ))}
          </div>
        </div>

        {/* PANEL B: SECURE USER PROFILE VIEW */}
        <div style={{ background: "#fff", padding: "24px", borderRadius: "16px", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", justifyContent: "between" }}>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#111827", marginTop: "0", marginBottom: "4px" }}>👤 Secure Professional Identity</h2>
            <p style={{ fontSize: "13px", color: "#4b5563", marginTop: "0", marginBottom: "16px" }}>Account Level Status: <strong style={{ color: "#16a34a" }}>{userTier}</strong></p>
            
            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "#374151", display: "block", marginBottom: "6px" }}>COUNTRY LOCATION CODE</label>
              <input type="text" value={country} onChange={(e) => setCountry(e.target.value.toUpperCase())} maxLength={3} style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "8px", boxSizing: "border-box", fontSize: "14px" }} />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "#374151", display: "block", marginBottom: "6px" }}>PROFESSIONAL BIO & CAREER GOALS</label>
              <textarea placeholder="Tell us about your brilliant skills and career goals..." value={bio} onChange={(e) => setBio(e.target.value)} rows={4} style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "8px", boxSizing: "border-box", fontSize: "14px", resize: "none" }} />
            </div>
          </div>

          <button onClick={saveProfile} disabled={isSaving} style={{ width: "100%", background: "#111827", color: "#fff", padding: "12px", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "14px" }}>
            {isSaving ? "Securing Ledger Record..." : "Save Identity Parameters"}
          </button>
        </div>

      </div>
    </div>
  );
}
