import React from "react";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ProgressRow = {
  quiz_score: number | null;
  is_completed: boolean | null;
  completed_at: string | null;
  course_id: string | null;
};

export default async function AcademyRecordsPage() {
  let progressRows: ProgressRow[] = [];
  let loadError = "";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    loadError = "Supabase configuration is missing.";
  } else {
    try {
      const parsedUrl = new URL(supabaseUrl);

      if (!["https:", "http:"].includes(parsedUrl.protocol)) {
        throw new Error("Invalid Supabase URL protocol.");
      }

      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });

      const { data, error } = await supabase
        .from("user_course_progress")
        .select("quiz_score, is_completed, completed_at, course_id")
        .order("completed_at", { ascending: false });

      if (error) {
        console.error("Academy records query failed:", error.message);
        loadError = "Academy records are temporarily unavailable.";
      } else {
        progressRows = (data || []) as ProgressRow[];
      }
    } catch (error) {
      console.error(
        "Academy records initialization failed:",
        error instanceof Error ? error.message : "Unknown error"
      );
      loadError = "Academy records are temporarily unavailable.";
    }
  }

  return (
    <main
      style={{
        padding: "40px",
        background: "#050505",
        minHeight: "100vh",
        color: "#fff",
        fontFamily: "system-ui",
      }}
    >
      <h1 style={{ fontSize: "24px", color: "#00c389", marginBottom: "4px" }}>
        SkillBridge Academy
      </h1>
      <p style={{ color: "#888", fontSize: "14px", marginBottom: "24px" }}>
        Student Certification Records
      </p>

      {loadError && (
        <p role="status" style={{ color: "#f0b45b", marginBottom: "16px" }}>
          {loadError}
        </p>
      )}

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#0a0a0a",
            border: "1px solid #222",
          }}
        >
          <thead>
            <tr
              style={{
                background: "#111",
                borderBottom: "1px solid #222",
                textAlign: "left",
              }}
            >
              <th style={{ padding: "12px", color: "#888" }}>Course Code Ref</th>
              <th style={{ padding: "12px", color: "#888" }}>Quiz Score</th>
              <th style={{ padding: "12px", color: "#888" }}>Status</th>
              <th style={{ padding: "12px", color: "#888" }}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {progressRows.map((row, index) => (
              <tr
                key={`${row.course_id ?? "course"}-${index}`}
                style={{ borderBottom: "1px solid #1c1c1c" }}
              >
                <td style={{ padding: "12px", fontFamily: "monospace", color: "#aaa" }}>
                  {row.course_id ?? "—"}
                </td>
                <td style={{ padding: "12px", color: "#00c389", fontWeight: "bold" }}>
                  {row.quiz_score == null ? "—" : `${row.quiz_score}%`}
                </td>
                <td style={{ padding: "12px", color: "#00c389" }}>
                  {row.is_completed ? "COMPLETED" : "IN PROGRESS"}
                </td>
                <td style={{ padding: "12px", color: "#888" }}>
                  {row.completed_at
                    ? new Date(row.completed_at).toLocaleString()
                    : "—"}
                </td>
              </tr>
            ))}
            {progressRows.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: "18px", color: "#888" }}>
                  {loadError
                    ? "Records could not be loaded."
                    : "No course records found yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
