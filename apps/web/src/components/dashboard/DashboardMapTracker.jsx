'use client';

import React, { useState, useEffect } from 'react';

export default function DashboardMapTracker() {
  // Safe mock telemetry arrays to prevent runtime execution or pre-rendering crashes
  const [riders, setRiders] = useState([
    { id: 'R-01', name: 'Rider Alpha', lat: 5.6037, lng: -0.1870, status: 'active', battery_percentage: 88 },
    { id: 'R-02', name: 'Rider Beta', lat: 5.6102, lng: -0.1921, status: 'active', battery_percentage: 74 },
    { id: 'R-03', name: 'Rider Gamma', lat: 5.5984, lng: -0.1752, status: 'offline', battery_percentage: 42 }
  ]);

  return (
    <div className="w-full bg-slate-900 text-slate-100 p-2 rounded-xl">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-mono tracking-widest uppercase animate-pulse w-fit">
        <span className="h-1.5 w-2 bg-emerald-400 rounded-full"></span>
        Live Stream Active
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-lg">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Active Riders</p>
          <p className="text-xl font-black font-mono mt-1 text-slate-100">
            {riders.filter(r => r.status === 'active').length.toString().padStart(2, '0')}
          </p>
        </div>
        <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-lg">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Dispatched Fleet Capacity</p>
          <p className="text-xl font-black font-mono mt-1 text-emerald-400">100%</p>
        </div>
        <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-lg">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Average Fleet Charge</p>
          <p className="text-xl font-black font-mono mt-1 text-sky-400">
            {(riders.reduce((acc, curr) => acc + curr.battery_percentage, 0) / riders.length).toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Active Dispatch Logs</h3>
        <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
          {riders.map((rider) => (
            <div key={rider.id} className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-800/50 rounded-lg hover:border-slate-700/80 transition-all duration-150">
              <div className="flex items-center gap-3">
                <div className="h-7 w-7 bg-slate-800 rounded flex items-center justify-center border border-slate-700 font-mono text-[10px] font-extrabold text-slate-300">
                  {rider.id.replace('R-', '')}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{rider.name}</h4>
                  <p className="text-[9px] text-slate-500 font-mono mt-0.5">Lat: {rider.lat.toFixed(4)} | Lng: {rider.lng.toFixed(4)}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                  rider.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {rider.status}
                </span>
                <p className="text-[10px] text-slate-400 font-mono">{rider.battery_percentage}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
