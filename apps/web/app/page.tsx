"use client";

import React, { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Courses, { CATALOG, buildChecklist } from "../components/dashboard/Courses";

const supabase = createClient(
  "https://aolfuonsuaeoitumuvqc.supabase.co",
  "sb_publishable_nLN657ZMe6wupW9HNdm6DQ_44_bZOjE"
);

type View =
  | "Dashboard"
  | "Learn"
  | "Practice"
  | "Projects"
  | "Paid Tasks"
  | "Earnings"
  | "Opportunities"
  | "Mentors"
  | "Messages";

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

// Design-sample values shown until live data is available.
const SAMPLE_LEARNING_PROGRESS = 72;
const SAMPLE_PAID_TASKS_COMPLETED = 8;
const SAMPLE_VERIFIED_TASKS = 3;
const SAMPLE_WALLET_TOTAL = 1240;
const SAMPLE_TREND = [120, 180, 150, 260, 310, 280, 420];
const SAMPLE_FEATURED_TASKS = [
  { id: "s1", title: "Design a Mobile App Onboarding Flow", payout: 250, tag: "UI/UX" },
  { id: "s2", title: "Create a Brand Logo Pack", payout: 180, tag: "Graphic Design" },
  { id: "s3", title: "Build a Landing Page for a Local Business", payout: 320, tag: "Web Design" },
];
const PORTFOLIO_ITEMS = [
  { id: "p1", title: "Mobile Tracking App", note: "UI/UX case study", icon: "📱" },
  { id: "p2", title: "Restaurant Website", note: "Responsive web design", icon: "🍽️" },
];

// Resolves the current site origin at runtime (localhost in dev, the live domain on Vercel).
const getAppOrigin = () => (typeof window !== "undefined" ? window.location.origin : "");

function formatCedi(value: number | null | undefined, decimals = 2) {
  const n = Number(value ?? 0);
  return `GH₵ ${n.toLocaleString("en-GH", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

function text(value: unknown, fallback = "") {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "GU";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
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

function CircleProgress({ percent, size = 64 }: { percent: number; size?: number }) {
  const stroke = 7;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(Math.max(percent, 0), 100) / 100) * circumference;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#e2e8f0" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#sb-ring)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <defs>
          <linearGradient id="sb-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "13px",
          fontWeight: 800,
          color: "#111827",
        }}
      >
        {percent}%
      </div>
    </div>
  );
}

function TrendChart({ points }: { points: number[] }) {
  const width = 320;
  const height = 130;
  const pad = 10;
  const max = Math.max(...points, 1);
  const stepX = points.length > 1 ? (width - pad * 2) / (points.length - 1) : 0;
  const coords = points.map((p, i) => ({
    x: pad + i * stepX,
    y: height - pad - (p / max) * (height - pad * 2),
  }));
  const line = coords.map((c) => `${c.x},${c.y}`).join(" ");
  const area = `${pad},${height - pad} ${line} ${pad + (points.length - 1) * stepX},${height - pad}`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto" }}>
      <defs>
        <linearGradient id="sb-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#sb-area)" />
      <polyline points={line} fill="none" stroke="#16a34a" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      {coords.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r="3.5" fill="#fff" stroke="#16a34a" strokeWidth="2" />
      ))}
    </svg>
  );
}

export default function SkillBridgeHub() {
  const [view, setView] = useState<View>("Dashboard");
  const [userTier, setUserTier] = useState("Beginner");
  const [bio, setBio] = useState("");
  const [country, setCountry] = useState("GH");
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [authReady, setAuthReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  // Name resolved from profiles.full_name, then auth metadata, then email prefix.
  const [fullName, setFullName] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [challenges, setChallenges] = useState<Row[]>([]);
  const [ledger, setLedger] = useState<Row[]>([]);
  const [doneChallenges, setDoneChallenges] = useState<Record<string, boolean>>({});

  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  // Paid Tasks workspace state
  const [paidTasks, setPaidTasks] = useState<Row[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const [deliverable, setDeliverable] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [taskMsg, setTaskMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Mentor messaging state
  const [messages, setMessages] = useState<Row[]>([]);
  const [draftMessage, setDraftMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [chatMsg, setChatMsg] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Loads everything scoped to a verified user.id
  const loadForUser = async (user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }) => {
    setSignedIn(true);
    setUserId(user.id);

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, account_tier, bio, country")
      .eq("id", user.id)
      .maybeSingle();

    const profileName = typeof profile?.full_name === "string" ? profile.full_name.trim() : "";
    const metaFull = user.user_metadata?.full_name;
    const metaName = typeof metaFull === "string" ? metaFull.trim() : "";
    const emailName = user.email ? user.email.split("@")[0] : "";
    setFullName(profileName || metaName || emailName || null);

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

    const { data: taskRows } = await supabase.from("paid_tasks").select("*").limit(50);
    if (taskRows) setPaidTasks(taskRows as Row[]);

    const { data: messageRows } = await supabase
      .from("mentor_messages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(200);
    if (messageRows) setMessages(messageRows as Row[]);
  };

  const clearUserState = () => {
    setSignedIn(false);
    setUserId(null);
    setFullName(null);
    setWallet(null);
    setLedger([]);
    setMessages([]);
    setPaidTasks([]);
    setChallenges([]);
  };

  useEffect(() => {
    async function init() {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      if (user) {
        await loadForUser(user as { id: string; email?: string | null; user_metadata?: Record<string, unknown> });
      }
      setAuthReady(true);
    }

    init();

    // Keep the header and identity box in sync with login / logout events
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        clearUserState();
      } else if (event === "SIGNED_IN") {
        supabase.auth.getUser().then(({ data }) => {
          if (data?.user) {
            loadForUser(data.user as { id: string; email?: string | null; user_metadata?: Record<string, unknown> });
          }
        });
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Real-time subscription for this user's mentor conversation
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`mentor-messages-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "mentor_messages", filter: `user_id=eq.${userId}` },
        (payload) => {
          const incoming = payload.new as Row;
          setMessages((current) =>
            current.some((m) => text(m.id) === text(incoming.id)) ? current : [...current, incoming]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  useEffect(() => {
    if (view === "Messages" || view === "Mentors") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, view]);

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
    window.location.assign(`${getAppOrigin()}/`);
  };

  const toggleLesson = (key: string) =>
    setCompleted((current) => ({ ...current, [key]: !current[key] }));

  const toggleChallenge = (key: string) =>
    setDoneChallenges((current) => ({ ...current, [key]: !current[key] }));

  const selectTask = (taskId: string | null) => {
    setActiveTaskId(taskId);
    setResponseText("");
    setDeliverable(null);
    setTaskMsg("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submitDeliverable = async (task: Row) => {
    setTaskMsg("");
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;
    if (!user) {
      setTaskMsg("Please log in to submit your work.");
      return;
    }
    if (!responseText.trim() && !deliverable) {
      setTaskMsg("Add a written response or upload a deliverable file before submitting.");
      return;
    }

    setSubmitting(true);
    let filePath: string | null = null;

    if (deliverable) {
      const safeName = deliverable.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${user.id}/${text(task.id)}/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from("deliverables").upload(path, deliverable);
      if (uploadError) {
        setTaskMsg("File upload failed. Please try again.");
        setSubmitting(false);
        return;
      }
      filePath = path;
    }

    const { error } = await supabase.from("task_submissions").insert({
      task_id: task.id,
      user_id: user.id,
      response_text: responseText.trim() || null,
      file_path: filePath,
      status: "Reviewing",
    });

    if (error) {
      setTaskMsg("Could not submit your work. Please try again.");
    } else {
      setTaskMsg("Submitted! Your work is now under review.");
      setResponseText("");
      setDeliverable(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    setSubmitting(false);
  };

  const sendMessage = async () => {
    const body = draftMessage.trim();
    if (!body) return;
    setChatMsg("");

    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;
    if (!user) {
      setChatMsg("Please log in to send messages.");
      return;
    }

    setSending(true);
    const { data, error } = await supabase
      .from("mentor_messages")
      .insert({ user_id: user.id, sender_role: "student", body })
      .select()
      .maybeSingle();

    if (error) {
      setChatMsg("Message could not be sent. Please try again.");
    } else {
      setDraftMessage("");
      if (data) {
        const inserted = data as Row;
        setMessages((current) =>
          current.some((m) => text(m.id) === text(inserted.id)) ? current : [...current, inserted]
        );
      }
    }
    setSending(false);
  };

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

  const sectionTitle: React.CSSProperties = {
    fontSize: "17px",
    fontWeight: 800,
    color: "#111827",
    margin: "0 0 14px 0",
  };

  const primaryButton: React.CSSProperties = {
    background: "linear-gradient(90deg, #2563eb, #1d4ed8)",
    color: "#fff",
    padding: "10px 18px",
    border: "none",
    borderRadius: "10px",
    fontWeight: 700,
    fontSize: "13px",
    cursor: "pointer",
  };

  // ---------- Derived header identity ----------
  const headerName = signedIn ? fullName || "Learner" : "Guest User";
  const headerRole = signedIn ? "Learner" : "Not signed in";
  const initials = getInitials(headerName);

  // ---------- Derived dashboard metrics ----------
  const walletTotal = wallet ? wallet.available_balance + wallet.pending_balance : SAMPLE_WALLET_TOTAL;
  const paidFromLedger = ledger.filter((row) => normalizeStatus(row.status) === "Paid").length;
  const paidTasksCompleted = signedIn && ledger.length > 0 ? paidFromLedger : SAMPLE_PAID_TASKS_COMPLETED;
  const trendPoints =
    signedIn && ledger.length >= 2
      ? ledger.slice(-7).map((row) => Number(row.amount ?? 0))
      : SAMPLE_TREND;
  const activeChallenges = challenges.filter((row) => row.is_active !== false);
  const nextChallenge = activeChallenges.find((row, i) => !doneChallenges[text(row.id, String(i))]) || null;
  const featuredTasks =
    paidTasks.length > 0
      ? paidTasks.slice(0, 3).map((row, i) => ({
          id: text(row.id, String(i)),
          title: text(row.title ?? row.name, `Task ${i + 1}`),
          payout: Number(row.reward_amount ?? row.payout ?? row.amount ?? 0),
          tag: text(row.skill_track ?? row.category, "General"),
        }))
      : SAMPLE_FEATURED_TASKS;

  const featuredCourse = CATALOG[0];
  const featuredChecklist = buildChecklist(featuredCourse);
  const featuredDone = featuredChecklist.filter((l) => completed[l.key]).length;
  const featuredPct = featuredChecklist.length
    ? Math.round((featuredDone / featuredChecklist.length) * 100)
    : 0;

  const goToTask = (taskId: string) => {
    setView("Paid Tasks");
    setActiveTaskId(taskId);
  };

  // ---------- Views ----------
  const renderDashboard = () => (
    <>
      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px" }}>
        <div style={card("linear-gradient(135deg, #60a5fa, #a855f7)")}>
          <div style={{ ...cardInner, padding: "18px", display: "flex", alignItems: "center", gap: "14px" }}>
            <CircleProgress percent={SAMPLE_LEARNING_PROGRESS} />
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>
                Learning Progress
              </div>
              <div style={{ fontSize: "16px", fontWeight: 800, color: "#111827" }}>
                {SAMPLE_LEARNING_PROGRESS}% complete
              </div>
              <button
                onClick={() => setView("Learn")}
                style={{ background: "none", border: "none", padding: 0, color: "#2563eb", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
              >
                View courses →
              </button>
            </div>
          </div>
        </div>

        <div style={card("linear-gradient(135deg, #a855f7, #2563eb)")}>
          <div style={{ ...cardInner, padding: "18px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Paid Tasks</div>
            <div style={{ fontSize: "26px", fontWeight: 800, color: "#111827", margin: "6px 0 2px 0" }}>
              {paidTasksCompleted}
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#6b7280", marginLeft: "6px" }}>completed</span>
            </div>
            <button
              onClick={() => setView("Paid Tasks")}
              style={{ background: "none", border: "none", padding: 0, color: "#2563eb", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
            >
              Track tasks →
            </button>
          </div>
        </div>

        <div style={card("linear-gradient(135deg, #22c55e, #0ea5e9)")}>
          <div style={{ ...cardInner, padding: "18px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>
              Wallet Total Balance
            </div>
            <div style={{ fontSize: "26px", fontWeight: 800, color: "#111827", margin: "6px 0 2px 0" }}>
              {formatCedi(walletTotal, 0)}
            </div>
            <button
              onClick={() => setView("Earnings")}
              style={{ background: "none", border: "none", padding: 0, color: "#2563eb", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
            >
              View earnings →
            </button>
          </div>
        </div>

        <div style={card("linear-gradient(135deg, #f59e0b, #ef4444)")}>
          <div style={{ ...cardInner, padding: "18px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>
              Verified Tasks
            </div>
            <div style={{ fontSize: "26px", fontWeight: 800, color: "#111827", margin: "6px 0 6px 0" }}>
              {SAMPLE_VERIFIED_TASKS}
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#6b7280", marginLeft: "6px" }}>items</span>
            </div>
            <span
              style={{ fontSize: "11px", fontWeight: 700, background: "#dcfce7", color: "#166534", padding: "3px 10px", borderRadius: "999px" }}
            >
              ✓ Verified
            </span>
          </div>
        </div>
      </div>

      {/* Central workspace */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "18px" }}>
        <div style={card("linear-gradient(135deg, #60a5fa, #a855f7)")}>
          <div style={cardInner}>
            <h3 style={sectionTitle}>Continue Learning</h3>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#2563eb", background: "#dbeafe", display: "inline-block", padding: "3px 10px", borderRadius: "999px" }}>
              {featuredCourse.cat}
            </div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#1f2937", margin: "10px 0 4px 0" }}>
              {featuredCourse.title}
            </div>
            <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "14px" }}>
              {featuredCourse.lessons} lessons • {featuredCourse.time}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>
              <span>Progress</span>
              <span>{featuredPct}%</span>
            </div>
            <div style={{ width: "100%", height: "8px", borderRadius: "999px", background: "#e2e8f0", overflow: "hidden", marginBottom: "16px" }}>
              <div
                style={{
                  height: "100%",
                  width: `${featuredPct}%`,
                  background: "linear-gradient(90deg, #2563eb, #7c3aed)",
                  borderRadius: "999px",
                  transition: "width 0.4s ease",
                }}
              />
            </div>
            <button
              onClick={() => {
                setActiveCourseId(featuredCourse.id);
                setView("Learn");
              }}
              style={primaryButton}
            >
              Continue Course
            </button>
          </div>
        </div>

        <div style={card("linear-gradient(135deg, #f59e0b, #ef4444)")}>
          <div style={cardInner}>
            <h3 style={sectionTitle}>Next Action</h3>
            {nextChallenge ? (
              <>
                <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={Boolean(doneChallenges[text(nextChallenge.id)])}
                    onChange={() => toggleChallenge(text(nextChallenge.id))}
                    style={{ width: "16px", height: "16px", marginTop: "3px", cursor: "pointer" }}
                  />
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#1f2937" }}>
                      {text(nextChallenge.title ?? nextChallenge.name, "Practice challenge")}
                    </div>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "6px" }}>
                      {text(nextChallenge.skill_track ?? nextChallenge.track ?? nextChallenge.category, "General")} •{" "}
                      {text(nextChallenge.difficulty ?? nextChallenge.difficulty_level, "Beginner")} •{" "}
                      {text(nextChallenge.estimated_minutes ?? nextChallenge.est_minutes ?? nextChallenge.duration_minutes, "—")} min
                    </div>
                  </div>
                </label>
              </>
            ) : (
              <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
                {signedIn
                  ? "You're all caught up. New practice challenges will appear here."
                  : "Log in to see your next practice challenge."}
              </p>
            )}
            <button onClick={() => setView("Practice")} style={{ ...primaryButton, marginTop: "18px" }}>
              Start Practice
            </button>
          </div>
        </div>

        <div style={card("linear-gradient(135deg, #22c55e, #0ea5e9)")}>
          <div style={cardInner}>
            <h3 style={sectionTitle}>Your Earnings Trend</h3>
            <TrendChart points={trendPoints} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#6b7280", marginTop: "8px" }}>
              <span>Last {trendPoints.length} payouts</span>
              <span style={{ color: "#166534", fontWeight: 700 }}>
                {formatCedi(trendPoints.reduce((a, b) => a + b, 0), 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured paid tasks */}
      <div style={card("linear-gradient(135deg, #a855f7, #2563eb)")}>
        <div style={cardInner}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h3 style={{ ...sectionTitle, margin: 0 }}>Available Featured Paid Tasks</h3>
            <button
              onClick={() => setView("Paid Tasks")}
              style={{ background: "none", border: "none", color: "#2563eb", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
            >
              View all →
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
            {featuredTasks.map((task) => (
              <div
                key={task.id}
                style={{ padding: "16px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "14px", display: "flex", flexDirection: "column", gap: "10px" }}
              >
                <span
                  style={{ alignSelf: "flex-start", fontSize: "11px", fontWeight: 700, background: "#dbeafe", color: "#1d4ed8", padding: "3px 10px", borderRadius: "999px" }}
                >
                  {task.tag}
                </span>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#1f2937", lineHeight: 1.4 }}>{task.title}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                  <span style={{ fontSize: "16px", fontWeight: 800, color: "#166534" }}>{formatCedi(task.payout, 0)}</span>
                  <button onClick={() => goToTask(task.id)} style={{ ...primaryButton, padding: "8px 14px" }}>
                    View Task
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Portfolio */}
      <div style={card("linear-gradient(135deg, #34d399, #2563eb)")}>
        <div style={cardInner}>
          <h3 style={sectionTitle}>Your Portfolio</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
            {PORTFOLIO_ITEMS.map((item) => (
              <a
                key={item.id}
                href="#"
                onClick={(e) => e.preventDefault()}
                style={{ display: "flex", alignItems: "center", gap: "14px", padding: "16px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "14px", textDecoration: "none" }}
              >
                <div style={{ fontSize: "28px" }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#1f2937" }}>{item.title}</div>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>{item.note}</div>
                </div>
                <span style={{ marginLeft: "auto", color: "#2563eb", fontWeight: 700, fontSize: "13px" }}>View →</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  const renderLearn = () => (
    <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", alignItems: "flex-start" }}>
      <Courses
        userTier={userTier}
        completed={completed}
        toggleLesson={toggleLesson}
        activeCourseId={activeCourseId}
        setActiveCourseId={setActiveCourseId}
      />

      <div style={{ ...card("linear-gradient(135deg, #34d399, #2563eb)"), flex: "1 1 360px", maxWidth: "440px" }}>
        <div style={cardInner}>
          <h2 style={{ fontSize: "19px", fontWeight: 800, color: "#111827", margin: "0 0 16px 0" }}>
            Secure Professional Identity
          </h2>

          {!authReady ? (
            <p style={{ fontSize: "14px", color: "#6b7280" }}>Loading your profile...</p>
          ) : !signedIn ? (
            <p style={{ fontSize: "14px", color: "#6b7280" }}>Please log in to manage your profile.</p>
          ) : (
            <>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "6px" }}>FULL NAME</div>
              <div
                style={{ padding: "10px", border: "1px solid #e5e7eb", borderRadius: "8px", background: "#f8fafc", marginBottom: "14px", fontSize: "14px", color: "#1f2937" }}
              >
                {fullName || "Not set"}
              </div>

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
                style={{ ...primaryButton, width: "100%", padding: "12px", fontSize: "14px", opacity: isSaving ? 0.7 : 1 }}
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

  const renderPaidTasks = () => {
    const activeTask = paidTasks.find((row, i) => text(row.id, String(i)) === activeTaskId) || null;

    return (
      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ ...card("linear-gradient(135deg, #a855f7, #2563eb)"), flex: "1 1 340px", maxWidth: "420px" }}>
          <div style={cardInner}>
            <h2 style={{ fontSize: "19px", fontWeight: 800, color: "#111827", margin: "0 0 16px 0" }}>Paid Tasks</h2>
            {!signedIn ? (
              <p style={{ fontSize: "14px", color: "#6b7280" }}>Please log in to view paid tasks.</p>
            ) : paidTasks.length === 0 ? (
              <p style={{ fontSize: "14px", color: "#6b7280" }}>No paid tasks available right now.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {paidTasks.map((row, i) => {
                  const key = text(row.id, String(i));
                  const isActive = key === activeTaskId;
                  return (
                    <div
                      key={key}
                      onClick={() => selectTask(isActive ? null : key)}
                      style={{
                        padding: "14px",
                        borderRadius: "12px",
                        cursor: "pointer",
                        background: isActive ? "#f5f3ff" : "#f9fafb",
                        border: isActive ? "1px solid #a78bfa" : "1px solid #e5e7eb",
                      }}
                    >
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#1f2937" }}>
                        {text(row.title ?? row.name, `Task ${i + 1}`)}
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px", fontSize: "12px", alignItems: "center" }}>
                        <span style={{ background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: "999px", fontWeight: 700 }}>
                          {formatCedi(Number(row.reward_amount ?? row.payout ?? row.amount ?? 0))}
                        </span>
                        <span style={{ background: "#dbeafe", color: "#1d4ed8", padding: "2px 8px", borderRadius: "999px", fontWeight: 700 }}>
                          {text(row.skill_track ?? row.category, "General")}
                        </span>
                        {row.deadline ? (
                          <span style={{ color: "#6b7280" }}>Due {new Date(text(row.deadline)).toLocaleDateString()}</span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div style={{ ...card("linear-gradient(135deg, #34d399, #2563eb)"), flex: "2 1 460px", maxWidth: "640px" }}>
          <div style={cardInner}>
            {!activeTask ? (
              <>
                <h2 style={{ fontSize: "19px", fontWeight: 800, color: "#111827", margin: "0 0 8px 0" }}>Task Workspace</h2>
                <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
                  Select a paid task from the list to view its brief and submit your work.
                </p>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: "19px", fontWeight: 800, color: "#111827", margin: "0 0 4px 0" }}>
                  {text(activeTask.title ?? activeTask.name, "Task Workspace")}
                </h2>
                <p style={{ fontSize: "13px", color: "#4b5563", margin: "0 0 16px 0" }}>
                  Reward:{" "}
                  <strong style={{ color: "#166534" }}>
                    {formatCedi(Number(activeTask.reward_amount ?? activeTask.payout ?? activeTask.amount ?? 0))}
                  </strong>
                </p>

                <div style={{ fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "6px" }}>TASK BRIEF</div>
                <div
                  style={{
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "14px",
                    fontSize: "14px",
                    color: "#334155",
                    lineHeight: 1.6,
                    marginBottom: "18px",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {text(activeTask.brief ?? activeTask.description, "No brief has been provided for this task.")}
                </div>

                <label style={{ fontSize: "12px", fontWeight: 700, color: "#374151", display: "block", marginBottom: "6px" }}>
                  YOUR RESPONSE
                </label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={6}
                  placeholder="Describe your approach, share links, or paste your answer here..."
                  style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "8px", boxSizing: "border-box", marginBottom: "14px", resize: "vertical", fontSize: "14px" }}
                />

                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => setDeliverable(e.target.files?.[0] ?? null)}
                  style={{ display: "none" }}
                />
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "18px" }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ background: "#fff", border: "1px dashed #2563eb", color: "#2563eb", padding: "10px 16px", borderRadius: "10px", fontWeight: 700, cursor: "pointer", fontSize: "13px" }}
                  >
                    [+ Upload Deliverable File]
                  </button>
                  <span style={{ fontSize: "13px", color: deliverable ? "#334155" : "#94a3b8", wordBreak: "break-all" }}>
                    {deliverable ? deliverable.name : "No file attached"}
                  </span>
                </div>

                <button
                  onClick={() => submitDeliverable(activeTask)}
                  disabled={submitting}
                  style={{ ...primaryButton, width: "100%", padding: "12px", fontSize: "14px", opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? "Submitting..." : "Submit Proof of Work"}
                </button>
                {taskMsg && <p style={{ marginTop: "12px", fontSize: "13px", fontWeight: 600, color: "#374151" }}>{taskMsg}</p>}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderMessages = () => (
    <div style={card("linear-gradient(135deg, #38bdf8, #6366f1)")}>
      <div style={cardInner}>
        <h2 style={{ fontSize: "19px", fontWeight: 800, color: "#111827", margin: "0 0 4px 0" }}>Mentor Messages</h2>
        <p style={{ fontSize: "13px", color: "#4b5563", margin: "0 0 16px 0" }}>
          Live conversation with your reviewer and mentor.
        </p>

        <div
          style={{
            height: "380px",
            overflowY: "auto",
            background: "#f8fafc",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {!signedIn ? (
            <p style={{ fontSize: "14px", color: "#6b7280" }}>Please log in to view your messages.</p>
          ) : messages.length === 0 ? (
            <p style={{ fontSize: "14px", color: "#6b7280" }}>
              No messages yet. Reviewer feedback will appear here, for example: "Please correct the logo placement and resubmit."
            </p>
          ) : (
            messages.map((row, i) => {
              const mine = text(row.sender_role).toLowerCase() === "student";
              return (
                <div key={text(row.id, String(i))} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
                  <div
                    style={{
                      maxWidth: "75%",
                      padding: "10px 14px",
                      borderRadius: mine ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                      background: mine ? "linear-gradient(90deg, #2563eb, #1d4ed8)" : "#fff",
                      color: mine ? "#fff" : "#1f2937",
                      border: mine ? "none" : "1px solid #e5e7eb",
                      fontSize: "14px",
                      lineHeight: 1.5,
                      wordBreak: "break-word",
                    }}
                  >
                    {!mine && (
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#6366f1", marginBottom: "4px" }}>
                        {text(row.sender_name, "Reviewer")}
                      </div>
                    )}
                    <div>{text(row.body ?? row.message)}</div>
                    {row.created_at ? (
                      <div style={{ fontSize: "10px", opacity: 0.7, marginTop: "4px", textAlign: "right" }}>
                        {new Date(text(row.created_at)).toLocaleString()}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
          <input
            type="text"
            value={draftMessage}
            onChange={(e) => setDraftMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            placeholder="Type your message to your mentor..."
            disabled={!signedIn}
            style={{ flex: 1, padding: "12px", border: "1px solid #d1d5db", borderRadius: "10px", fontSize: "14px", minWidth: 0 }}
          />
          <button
            onClick={sendMessage}
            disabled={sending || !signedIn}
            style={{ ...primaryButton, padding: "12px 20px", fontSize: "14px", opacity: sending || !signedIn ? 0.7 : 1 }}
          >
            {sending ? "Sending..." : "Send Message"}
          </button>
        </div>
        {chatMsg && <p style={{ marginTop: "10px", fontSize: "13px", fontWeight: 600, color: "#b91c1c" }}>{chatMsg}</p>}
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

  const isBuiltView =
    view === "Dashboard" ||
    view === "Learn" ||
    view === "Practice" ||
    view === "Earnings" ||
    view === "Paid Tasks" ||
    view === "Messages" ||
    view === "Mentors";

  const unreadCount = messages.filter((m) => text(m.sender_role).toLowerCase() !== "student").length;

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "system-ui, sans-serif", background: "#f1f5f9" }}>
      <aside
        style={{
          width: "240px",
          background: "#0f172a",
          color: "#e2e8f0",
          padding: "28px 18px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          flexShrink: 0,
        }}
      >
        <div style={{ fontSize: "18px", fontWeight: 800, color: "#fff", marginBottom: "28px", paddingLeft: "10px" }}>
          SkillBridge
        </div>
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
            style={{
              marginTop: "auto",
              textAlign: "left",
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid #334155",
              background: "transparent",
              color: "#94a3b8",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Sign out
          </button>
        )}
      </aside>

      <main style={{ flex: 1, padding: "28px 32px", display: "flex", flexDirection: "column", gap: "22px", minWidth: 0 }}>
        {/* Global top header */}
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "14px 22px",
            border: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            gap: "18px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: "1 1 280px", position: "relative", minWidth: 0 }}>
            <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "14px" }}>
              🔍
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses, tasks, mentors..."
              style={{ width: "100%", padding: "11px 14px 11px 40px", border: "1px solid #e2e8f0", borderRadius: "12px", background: "#f8fafc", fontSize: "14px", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{ width: "9px", height: "9px", borderRadius: "999px", background: "#22c55e", display: "inline-block", animation: "sb-pulse 1.6s infinite" }}
            />
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#166534" }}>MTN Mobile Money Connected</span>
          </div>

          <button
            aria-label="Notifications"
            style={{ position: "relative", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", width: "42px", height: "42px", cursor: "pointer", fontSize: "18px" }}
          >
            🔔
            <span
              style={{ position: "absolute", top: "-4px", right: "-4px", background: "#ef4444", color: "#fff", fontSize: "10px", fontWeight: 700, borderRadius: "999px", minWidth: "18px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              3
            </span>
          </button>

          <button
            aria-label="Messages"
            onClick={() => setView("Messages")}
            style={{ position: "relative", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", width: "42px", height: "42px", cursor: "pointer", fontSize: "18px" }}
          >
            💬
            {unreadCount > 0 && (
              <span
                style={{ position: "absolute", top: "-4px", right: "-4px", background: "#2563eb", color: "#fff", fontSize: "10px", fontWeight: 700, borderRadius: "999px", minWidth: "18px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "999px",
                background: signedIn ? "linear-gradient(135deg, #2563eb, #7c3aed)" : "#94a3b8",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "14px",
              }}
            >
              {initials}
            </div>
            <div style={{ lineHeight: 1.25 }}>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>{headerName}</div>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>{headerRole}</div>
            </div>
          </div>
        </div>

        {view === "Dashboard" && renderDashboard()}
        {view === "Learn" && renderLearn()}
        {view === "Practice" && renderPractice()}
        {view === "Earnings" && renderEarnings()}
        {view === "Paid Tasks" && renderPaidTasks()}
        {(view === "Messages" || view === "Mentors") && renderMessages()}
        {!isBuiltView && renderPlaceholder(view)}
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
