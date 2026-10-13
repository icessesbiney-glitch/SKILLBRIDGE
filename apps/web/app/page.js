'use client';

import React from 'react';
import DashboardMapTracker from '../src/components/dashboard/DashboardMapTracker';

export default function DashboardMasterIndex() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 flex flex-col gap-6">
      {/* Global Application Nav Header */}
      <header className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 uppercase tracking-wider">
            SKILLBRIDGE CONTROL HUB
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Hyperlocal Logistics & Dispatch Operational Telemetry
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1 rounded">
            SYS STATUS: ONLINE
          </span>
        </div>
      </header>

      {/* Main Core Dashboard Layout Grid Area */}
      <section className="w-full max-w-7xl mx-auto grid grid-cols-1 gap-6">
        {/* Real-time Tracking and Telemetry Map Section Area */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 shadow-xl">
          <div className="mb-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Live Fleet Dispatches
            </h2>
            <p className="text-[10px] text-slate-500">
              Real-time GPS coordinate logging and vehicle state monitors
            </p>
          </div>
          
          {/* Integrated Core Map Tracking Layer Component */}
          <DashboardMapTracker />
        </div>
      </section>
    </main>
  );
}
