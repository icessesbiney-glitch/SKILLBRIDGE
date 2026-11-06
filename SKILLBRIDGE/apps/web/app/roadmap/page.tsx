import React from "react";
import * as siteContent from "../../data/siteContent";

export default function RoadmapPage() {
  const mentorGuidance = (siteContent as any).mentorGuidance || [];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">SkillBridge Project Roadmap Matrix</h1>
      <p className="text-gray-600 mb-6">Live and active development milestones tracking interface console.</p>
      
      <div className="space-y-4">
        {mentorGuidance && mentorGuidance.length > 0 ? (
          mentorGuidance.map((item: any, index: number) => (
            <div key={index} className="p-4 border rounded shadow-sm bg-white">
              <h3 className="font-semibold text-lg">{item?.title || "Milestone Item"}</h3>
              <p className="text-gray-500 mt-1">{item?.description || "No description provided."}</p>
            </div>
          ))
        ) : (
          <div className="p-8 border border-dashed rounded text-center text-gray-400">
            No active roadmap data structures found in siteContent files.
          </div>
        )}
      </div>
    </div>
  );
}
