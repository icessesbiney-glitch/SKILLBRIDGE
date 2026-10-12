import React from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export const revalidate = 0;

export default async function AcademyRecordsPage() {
  const { data: progressRows } = await supabase
    .from("user_course_progress")
    .select("quiz_score, is_completed, completed_at, course_id")
    .order("completed_at", { ascending: false });

  return (
    <div style={{ padding: "40px", background: "#050505", minHeight: "100vh", color: "#fff", fontFamily: "system-ui" }}>
      <h2 style={{ fontSize: "24px", color: "#00c389", marginBottom: "4px" }}>SkillBridge Academy</h2>
      <p style={{ color: "#666", fontSize: "14px", marginBottom: "24px" }}>Live Browser Audit Log — Student Certification Records</p>
      <table style={{ width: "100%", borderCollapse: "collapse", background: "#0a0a0a", border: "1px solid #222" }}>
        <thead>
          <tr style={{ background: "#111", borderBottom: "1px solid #222", textAlign: "left" }}>
            <th style={{ padding: "12px", color: "#888" }}>Course Code Ref</th>
            <th style={{ padding: "12px", color: "#888" }}>Quiz Score</th>
            <th style={{ padding: "12px", color: "#888" }}>Status</th>
            <th style={{ padding: "12px", color: "#888" }}>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {progressRows?.map((row: any, i: number) => (
            <tr key={i} style={{ borderBottom: "1px solid #1c1c1c" }}>
              <td style={{ padding: "12px", fontFamily: "monospace", color: "#aaa" }}>{row.course_id}</td>
              <td style={{ padding: "12px", color: "#00c389", fontWeight: "bold" }}>{row.quiz_score}%</td>
              <td style={{ padding: "12px", color: "#00c389" }}>✓ ISSUED</td>
              <td style={{ padding: "12px", color: "#666" }}>{String(row.completed_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
