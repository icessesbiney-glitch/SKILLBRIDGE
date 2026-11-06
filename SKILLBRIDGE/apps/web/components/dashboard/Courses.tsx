"use client";

import React from "react";

export type CatalogCourse = {
  id: string;
  title: string;
  cat: string;
  lvl: string;
  lessons: number;
  time: string;
};

export const CATALOG: CatalogCourse[] = [
  { id: "ux-ui", title: "UX/UI Design Foundations", cat: "UI/UX", lvl: "Beginner", lessons: 24, time: "6 weeks" },
  { id: "canva", title: "Canva Graphics Masterclass", cat: "Graphic Design", lvl: "Beginner", lessons: 12, time: "2 weeks" },
  { id: "freelance", title: "Global Freelancing Essentials", cat: "Career Building", lvl: "Beginner", lessons: 10, time: "2 weeks" },
];

const LESSON_TITLES = ["Introduction", "Core Fundamentals", "Practical Deliverable Assignment"];

export function buildChecklist(course: CatalogCourse) {
  const total = Math.min(course.lessons, 12);
  return Array.from({ length: total }, (_, i) => ({
    key: `${course.id}-lesson-${i + 1}`,
    label: `Lesson ${i + 1}: ${LESSON_TITLES[i] || `Module ${i + 1}`}`,
  }));
}

export type CoursesProps = {
  userTier: string;
  completed: Record<string, boolean>;
  toggleLesson: (key: string) => void;
  activeCourseId: string | null;
  setActiveCourseId: (id: string | null) => void;
};

export default function Courses({
  userTier,
  completed,
  toggleLesson,
  activeCourseId,
  setActiveCourseId,
}: CoursesProps) {
  return (
    <div
      style={{
        borderRadius: "18px",
        padding: "2px",
        background: "linear-gradient(135deg, #60a5fa, #a855f7)",
        flex: "1 1 460px",
        maxWidth: "560px",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "24px",
          height: "100%",
          boxSizing: "border-box",
        }}
      >
        <h2 style={{ fontSize: "19px", fontWeight: 800, color: "#111827", margin: "0 0 4px 0" }}>
          Free Learning Catalog
        </h2>
        <p style={{ fontSize: "13px", color: "#4b5563", margin: "0 0 18px 0" }}>
          Account Status:{" "}
          <strong style={{ color: userTier === "Premium" ? "#2563eb" : "#16a34a" }}>{userTier}</strong>
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
                <div
                  onClick={() => setActiveCourseId(isActive ? null : course.id)}
                  style={{ cursor: "pointer" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        background: "#dbeafe",
                        color: "#2563eb",
                        padding: "4px 8px",
                        borderRadius: "20px",
                      }}
                    >
                      {course.cat}
                    </span>
                    <span style={{ fontSize: "11px", color: "#16a34a", fontWeight: 700 }}>{course.lvl}</span>
                  </div>
                  <h4 style={{ margin: "8px 0 4px 0", fontSize: "15px", fontWeight: 700, color: "#1f2937" }}>
                    {course.title}
                  </h4>
                  <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
                    {course.lessons} Lessons • {course.time} •{" "}
                    <span style={{ color: "#16a34a", fontWeight: 600 }}>100% Free</span>
                  </p>
                </div>

                {isActive && (
                  <>
                    <div style={{ marginTop: "14px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#475569",
                          marginBottom: "4px",
                        }}
                      >
                        <span>Progress</span>
                        <span>{pct}%</span>
                      </div>
                      <div
                        style={{
                          width: "100%",
                          height: "8px",
                          borderRadius: "999px",
                          background: "#e2e8f0",
                          overflow: "hidden",
                        }}
                      >
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

                    <ul
                      style={{
                        listStyle: "none",
                        padding: 0,
                        margin: "14px 0 0 0",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      {checklist.map((lesson) => (
                        <li
                          key={lesson.key}
                          style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}
                        >
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
  );
}
