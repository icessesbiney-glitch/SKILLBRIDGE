"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://aolfuonsuaeoitumuvqc.supabase.co",
  "sb_publishable_nLN657ZMe6wupW9HNdm6DQ_44_bZOjE"
);

type View = "Dashboard" | "Learn" | "Practice" | "Projects" | "Paid Tasks" | "Earnings" | "Opportunities" | "Mentors" | "Messages";

type CatalogCourse = {
  id: string;
  title: string;
  cat: string;
  lvl: string;
  lessons: number;
  time: string;
};

type Wallet = {
  available_balance: number;
  pending_balance: number;
};

type Row = Record<string, unknown>;

const SIDEBAR_LINKS: View[] = [
  "Dashboard",
  "Learn",
  "Practice",
  "Projects",
  "Paid Tasks",
  "Earnings",
  "Opportunities",
  "Mentors",
  "Messages",
];

const CATALOG: CatalogCourse[] = [
  { id: "ux-ui", title: "UX/UI Design Foundations", cat: "UI/UX", lvl: "Beginner", lessons: 24, time: "6 weeks" },
  { id: "canva", title: "Canva Graphics Masterclass", cat: "Graphic Design", lvl: "Beginner", lessons: 12, time: "2 weeks" },
  { id: "freelance", title: "Global Freelancing Essentials", cat: "Career Building", lvl: "Beginner", lessons: 10, time: "2 weeks" },
];

const LESSON_TITLES = ["Introduction", "Core Fundamentals", "Practical Deliverable Assignment"];

// Resolves the current site origin at runtime (localhost in dev, the live domain on Vercel).
const getAppOrigin = () => (typeof window !== "undefined" ? window.location.origin : "");

function buildChecklist(course: CatalogCourse) {
  const total = Math.min(course.lessons, 12);
  return Array.from({ length: total }, (_, i) => ({
    key: `${course.id}-lesson-${i + 1}`,
    label: `Lesson ${i + 1}: ${LESSON_TITLES[i] || `Module ${i + 1}`}`,
  }));
}

function formatCedi(value: number | null | undefined) {
  const n = Number(value ?? 0);
  return `GH₵ ${n.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function text(value: unknown, fallback = "") {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function normalizeStatus(value: unknown): "Paid" | "Reviewing" | "Pending" {
  const s = text(value).toLowerCase();
  if (s === "paid" || s === "completed" || s === "success") return "Paid";
  if (s === "reviewing" || s === "in_review" || s === "review") return "Reviewing";
  return "Pending";
}

const STATUS_STYLES: Record<string, { color: string; background: string }> = {
  Paid: { color: "#166534", background: "#dcfce7" },
  Reviewing: { color: "#1d4ed8", background: "#dbeafe" },
  Pending: { color: "#b45309", background: "#fef3c7" },
};

export default function SkillBridgeHub() {
  const [view, setView] = useState<View>("Learn");
  const [userTier, setUserTier] = useState("Beginner");
  const [bio, setBio] = useState("");
  const [country, setCountry] = useState("GH");
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [signedIn, setSignedIn] = useState(false);

  const [wallet, setWallet] = useState<Wallet>({ available_balance: 0, pending_balance: 0 });
  const [challenges, setChallenges] = useState<Row[]>([]);
  const [ledger, setLedger] = useState<Row[]>([]);
  const [doneChallenges, setDoneChallenges] = useState<Record<string, boolean>>({});

  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadAll() {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      if (!user) return;
      setSignedIn(true);

      const { data: profile } = await supabase
        .from("profiles")
        .select("account_tier, bio, country")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        if (profile.account_tier) setUserTier(profile.account_tier);
        if (profile.bio) setBio(profile.bio);
        if (profile.country) setCountry(profile.country);
      }

      const { data: walletRow } = await supabase
        .from("wallet_balances")
        .select("available_balance, pending_balance")
        .eq("user_id", user.id)
        .maybeSingle();

      if (walletRow) {
        setWallet({
          available_balance: Number(walletRow.available_balance ?? 0),
          pending_balance: Number(walletRow.pending_balance ?? 0),
        });
      }

      const { data: challengeRows } = await supabase.from("practice_challenges").select("*").limit(50);
      if (challengeRows) setChallenges(challengeRows as Row[]);

      const { data: ledgerRows } = await supabase
        .from("earnings_ledger")
        .select("*")
        .eq("user_id", user.id)
        .limit(100);
      if (ledgerRows) setLedger(ledgerRows as Row[]);
    }

    loadAll();
  }, []);

  const saveProfile = async () => {
    setIsSaving(true);
    setMsg("");
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;
    if (!user) {
      setMsg("Please log in to save your profile.");
      setIsSaving(false);
      return;
    }
    const { error } = await supabase.from("profiles").update({ bio, country }).eq("id", user.id);
    setMsg(error ? "Could not save your profile. Please try again." : "Profile saved successfully.");
    setIsSaving(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // Redirect to whichever origin we are running on (local or live).
    window.location.assign(`${getAppOrigin()}/`);
  };

  const toggleLesson = (key: string) =>
    setCompleted((current) => ({ ...current, [key]: !current[key] }));

  const toggleChallenge = (key: string) =>
    setDoneChallenges((current) => ({ ...current, [key]: !current[key] }));

  const card = (gradient: string): React.CSSProperties => ({
    borderRadius: "18px",
    padding: "2px",
    background: gradient,
  });

  const cardInner: React.CSSProperties = {
    background: "#fff",
    borderRadius: "16px",
    padding: "24px",
    height: "100%",
    boxSizing: "border-box",
  };

  const renderLearn = () => (
    <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", alignItems: "flex-start" }}>
      {/* Panel A: Learning Catalog */}
      <div style={{ ...card("linear-gradient(135deg, #60a5fa, #a855f7)"), flex: "1 1 460px", maxWidth: "560px" }}>
        <div style={cardInner}>
          <h2 style={{ fontSize: "19px", fontWeight: 800, color: "#111827", margin: "0 0 4px 0" }}>
            Free Learning Catalog
          </h2>
          <p style={{ fontSize: "13px", color: "#4b5563", margin: "0 0 18px 0" }}>
            Account Status: <strong style={{ color: userTier === "Premium" ? "#2563eb" : "#16a34a" }}>{userTier}</strong>
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {CATALOG.map((course) => {
              const isActive = activeCourseId === course.id;
              const checklist = isActive ? buildChecklist(course) : [];
              const done = checklist.filter((l) => completed[l.key]).length;
              const pct = checklist.length ? Math.round((done / checklist.length) * 100) : 0;

              return (
                <div
                  key={course.id}
                  style={{
                    padding: "14px",
                    borderRadius: "12px",
                    background: isActive ? "#f5f6ff" : "#f9fafb",
                    border: isActive ? "1px solid #a5b4fc" : "1px solid #e5e7eb",
                  }}
                >
                  <div onClick={() => setActiveCourseId(isActive ? null : course.id)} style={{ cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, background: "#dbeafe", color: "#2563eb", padding: "4px 8px", borderRadius: "20px" }}>
                        {course.cat}
                      </span>
                      <span style={{ fontSize: "11px", color: "#16a34a", fontWeight: 700 }}>{course.lvl}</span>
                    </div>
                    <h4 style={{ margin: "8px 0 4px 0", fontSize: "15px", fontWeight: 700, color: "#1f2937" }}>{course.title}</h4>
                    <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
                      {course.lessons} Lessons • {course.time} • <span style={{ color: "#16a34a", fontWeight: 600 }}>100% Free</span>
                    </p>
                  </div>

                  {isActive && (
                    <>
                      <div style={{ marginTop: "14px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>
                          <span>Progress</span>
                          <span>{pct}%</span>
                        </div>
                        <div style={{ width: "100%", height: "8px", borderRadius: "999px", background: "#e2e8f0", overflow: "hidden" }}>
                          <div
                            style={{
                              height: "100%",
                              width: `${pct}%`,
                              background: "linear-gradient(90deg, #2563eb, #7c3aed)",
                              borderRadius: "999px",
                              transition: "width 0.4s ease",
                            }}
                          />
                        </div>
                      </div>

                      <ul style={{ listStyle: "none", padding: 0, margin: "14px 0 0 0", display: "flex", flexDirection: "column", gap: "8px" }}>
                        {checklist.map((lesson) => (
                          <li key={lesson.key} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                            <input
                              type="checkbox"
                              checked={Boolean(completed[lesson.key])}
                              onChange={() => toggleLesson(lesson.key)}
                              style={{ width: "16px", height: "16px", cursor: "pointer" }}
                            />
                            <span
                              style={{
                                color: completed[lesson.key] ? "#94a3b8" : "#334155",
                                textDecoration: completed[lesson.key] ? "line-through" : "none",
                              }}
                            >
                              {lesson.label}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Panel B: Profile */}
      <div style={{ ...card("linear-gradient(135deg, #34d399, #2563eb)"), flex: "1 1 360px", maxWidth: "440px" }}>
        <div style={cardInner}>
          <h2 style={{ fontSize: "19px", fontWeight: 800, color: "#111827", margin: "0 0 16px 0" }}>
            Secure Professional Identity
          </h2>

          {!signedIn ? (
            <p style={{ fontSize: "14px", color: "#6b7280" }}>Please log in to manage your profile.</p>
          ) : (
            <>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#374151", display: "block", marginBottom: "6px" }}>
                COUNTRY LOCATION CODE
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value.toUpperCase())}
                maxLength={3}
                style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "8px", boxSizing: "border-box", marginBottom: "14px" }}
              />

              <label style={{ fontSize: "12px", fontWeight: 700, color: "#374151", display: "block", marginBottom: "6px" }}>
                PROFESSIONAL BIO & CAREER GOALS
              </label>
              <textarea
                placeholder="Tell us about your skills and career goals..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={5}
                style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "8px", boxSizing: "border-box", marginBottom: "16px", resize: "vertical" }}
              />

              <button
                onClick={saveProfile}
                disabled={isSaving}
                style={{
                  width: "100%",
                  background: "linear-gradient(90deg, #2563eb, #1d4ed8)",
                  color: "#fff",
                  padding: "12px",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: 700,
                  cursor: isSaving ? "default" : "pointer",
                  opacity: isSaving ? 0.7 : 1,
                }}
              >
                {isSaving ? "Saving..." : "Save Identity Parameters"}
              </button>
              {msg && <p style={{ marginTop: "12px", fontSize: "13px", fontWeight: 600, color: "#374151" }}>{msg}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderPractice = () => {
    const activeChallenges = challenges.filter((row) => row.is_active !== false);
    const doneCount = activeChallenges.filter((row, i) => doneChallenges[text(row.id, String(i))]).length;
    const pct = activeChallenges.length ? Math.round((doneCount / activeChallenges.length) * 100) : 0;

    return (
      <div style={card("linear-gradient(135deg, #f59e0b, #ef4444)")}>
        <div style={cardInner}>
          <h2 style={{ fontSize: "19px", fontWeight: 800, color: "#111827", margin: "0 0 4px 0" }}>Practice Challenges</h2>
          <p style={{ fontSize: "13px", color: "#4b5563", margin: "0 0 14px 0" }}>
            {doneCount} of {activeChallenges.length} completed ({pct}%)
          </p>
          <div style={{ width: "100%", height: "8px", borderRadius: "999px", background: "#e2e8f0", overflow: "hidden", marginBottom: "18px" }}>
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                background: "linear-gradient(90deg, #f59e0b, #ef4444)",
                borderRadius: "999px",
                transition: "width 0.4s ease",
              }}
            />
          </div>

          {!signedIn ? (
            <p style={{ fontSize: "14px", color: "#6b7280" }}>Please log in to view practice challenges.</p>
          ) : activeChallenges.length === 0 ? (
            <p style={{ fontSize: "14px", color: "#6b7280" }}>No practice challenges available yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {activeChallenges.map((row, i) => {
                const key = text(row.id, String(i));
                const isDone = Boolean(doneChallenges[key]);
                return (
                  <label
                    key={key}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      padding: "14px",
                      background: isDone ? "#f0fdf4" : "#f9fafb",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => toggleChallenge(key)}
                      style={{ width: "16px", height: "16px", marginTop: "2px", cursor: "pointer" }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: isDone ? "#94a3b8" : "#1f2937",
                          textDecoration: isDone ? "line-through" : "none",
                        }}
                      >
                        {text(row.title ?? row.name, `Challenge ${i + 1}`)}
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px", fontSize: "12px" }}>
                        <span style={{ background: "#dbeafe", color: "#1d4ed8", padding: "2px 8px", borderRadius: "999px", fontWeight: 700 }}>
                          {text(row.skill_track ?? row.track ?? row.category, "General")}
                        </span>
                        <span style={{ background: "#fef3c7", color: "#b45309", padding: "2px 8px", borderRadius: "999px", fontWeight: 700 }}>
                          {text(row.difficulty ?? row.difficulty_level, "Beginner")}
                        </span>
                        <span style={{ color: "#6b7280", padding: "2px 0" }}>
                          {text(row.estimated_minutes ?? row.est_minutes ?? row.duration_minutes, "—")} min
                        </span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderEarnings = () => (
    <div style={card("linear-gradient(135deg, #22c55e, #0ea5e9)")}>
      <div style={cardInner}>
        <h2 style={{ fontSize: "19px", fontWeight: 800, color: "#111827", margin: "0 0 16px 0" }}>Earnings Ledger</h2>
        {!signedIn ? (
          <p style={{ fontSize: "14px", color: "#6b7280" }}>Please log in to view your earnings.</p>
        ) : ledger.length === 0 ? (
          <p style={{ fontSize: "14px", color: "#6b7280" }}>No earnings recorded yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {ledger.map((row, i) => {
              const status = normalizeStatus(row.status);
              const style = STATUS_STYLES[status];
              const reference = text(row.reference_code ?? row.reference ?? row.ref_code ?? row.id, "—");
              return (
                <div
                  key={text(row.id, String(i))}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", padding: "12px 14px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "10px", flexWrap: "wrap" }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#1f2937" }}>
                      {text(row.description ?? row.title ?? row.source, "Payout")}
                    </div>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                      Ref: {reference}
                      {row.created_at ? ` • ${new Date(text(row.created_at)).toLocaleDateString()}` : ""}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "999px", color: style.color, background: style.background }}>
                      {status}
                    </span>
                    <span style={{ fontSize: "14px", fontWeight: 800, color: "#166534" }}>
                      {formatCedi(Number(row.amount ?? 0))}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderPlaceholder = (name: string) => (
    <div style={card("linear-gradient(135deg, #94a3b8, #64748b)")}>
      <div style={cardInner}>
        <h2 style={{ fontSize: "19px", fontWeight: 800, color: "#111827", margin: "0 0 8px 0" }}>{name}</h2>
        <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>This section is coming soon.</p>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "system-ui, sans-serif", background: "#f1f5f9" }}>
      <aside style={{ width: "240px", background: "#0f172a", color: "#e2e8f0", padding: "28px 18px", display: "flex", flexDirection: "column", gap: "6px", flexShrink: 0 }}>
        <div style={{ fontSize: "18px", fontWeight: 800, color: "#fff", marginBottom: "28px", paddingLeft: "10px" }}>SkillBridge</div>
        {SIDEBAR_LINKS.map((link) => {
          const isActive = link === view;
          return (
            <button
              key={link}
              onClick={() => setView(link)}
              style={{
                textAlign: "left",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "none",
                fontSize: "14px",
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "#fff" : "#94a3b8",
                background: isActive ? "linear-gradient(90deg, #2563eb, #1d4ed8)" : "transparent",
                cursor: "pointer",
              }}
            >
              {link}
            </button>
          );
        })}
        {signedIn && (
          <button
            onClick={handleSignOut}
            style={{ marginTop: "auto", textAlign: "left", padding: "10px 14px", borderRadius: "8px", border: "1px solid #334155", background: "transparent", color: "#94a3b8", fontSize: "14px", cursor: "pointer" }}
          >
            Sign out
          </button>
        )}
      </aside>

      <main style={{ flex: 1, padding: "32px", display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
        <div style={{ background: "#fff", borderRadius: "16px", padding: "18px 24px", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Available Balance</div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "#111827" }}>{formatCedi(wallet.available_balance)}</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Pending</div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "#b45309" }}>{formatCedi(wallet.pending_balance)}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "999px",
                background: "#22c55e",
                display: "inline-block",
                animation: "sb-pulse 1.6s infinite",
              }}
            />
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#166534" }}>MTN Mobile Money Connected</span>
          </div>
        </div>

        {view === "Learn" && renderLearn()}
        {view === "Practice" && renderPractice()}
        {view === "Earnings" && renderEarnings()}
        {view !== "Learn" && view !== "Practice" && view !== "Earnings" && renderPlaceholder(view)}
      </main>

      <style>{`
        @keyframes sb-pulse {
          0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.6); }
          70% { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
      `}</style>
    </div>
  );
}
