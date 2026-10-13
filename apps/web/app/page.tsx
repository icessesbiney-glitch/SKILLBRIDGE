"use client";
import React, { useState, useEffect } from "react";
interface Rider { rider_id: string; rider_name: string; current_latitude: number; current_longitude: number; battery_percentage: number; status: string; phone: string; }
export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [riders, setRiders] = useState<Rider[]>([]);
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "skillbridge2026") { setIsAuthenticated(true); }
  };
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchTelemetry = async () => {
      try {
        const res = await fetch("/api/data");
        const data = await res.json();
        if (data.status === "operational") { setRiders(data.riders); }
      } catch (err) { console.error(err); }
    };
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 3000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl text-center">
          <h1 className="text-xl font-black text-slate-100 uppercase tracking-wider mb-4">Terminal Lockout</h1>
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <input type="text" placeholder="Operator ID" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 text-sm" required />
            <input type="password" placeholder="Access Key" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 text-sm" required />
            <button type="submit" className="w-full bg-emerald-500 py-2.5 rounded-lg text-slate-950 font-bold uppercase tracking-wider text-xs">Authenticate</button>
          </form>
        </div>
      </main>
    );
  }
  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <h1 className="text-2xl font-black uppercase tracking-wide border-b border-slate-800 pb-4">Skillbridge Dispatch Live Logs</h1>
      <div className="mt-6 space-y-3">
        {riders.map(r => (
          <div key={r.rider_id} className="p-4 bg-slate-900 border border-slate-800 rounded-lg flex justify-between items-center">
            <div><p className="text-sm font-bold">{r.rider_name}</p><p className="text-xs text-slate-500 font-mono">Lat: {r.current_latitude.toFixed(4)} / Lon: {r.current_longitude.toFixed(4)}</p></div>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-black">{r.status}</span>
          </div>
        ))}
      </div>
    </main>
  );
}