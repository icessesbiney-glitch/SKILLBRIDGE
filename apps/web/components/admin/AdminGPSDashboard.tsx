'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface TelemetryPoint {
  id: number;
  latitude: number;
  longitude: number;
  current_status: 'on_duty' | 'off_duty' | 'on_delivery' | 'paused';
  recorded_at: string;
  gps_profiles: {
    user_id: string;
    profile_type: 'driver' | 'rider';
  };
}

export default function AdminGPSDashboard() {
  const [activeSignals, setActiveSignals] = useState<TelemetryPoint[]>([]);
  const [logMessages, setLogMessages] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogMessages((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 9)]);
  };

  useEffect(() => {
    const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
    addLog('📡 Initializing GPS global surveillance matrix stream...');

    // 1. Initial baseline fetch of latest active coordinates locations
    const fetchLiveLocations = async () => {
      const { data, error } = await supabase
        .from('gps_telemetry')
        .select(`
          id, latitude, longitude, current_status, recorded_at,
          gps_profiles ( user_id, profile_type )
        `)
        .order('recorded_at', { ascending: false });

      if (error) {
        addLog(`❌ Base query error: ${error.message}`);
        return;
      }

      // Filter for unique latest user coordinates markers only
      const uniqueSignals: Record<string, TelemetryPoint> = {};
      (data as any[] || []).forEach((row) => {
        const userId = row.gps_profiles?.user_id;
        if (userId && !uniqueSignals[userId]) {
          uniqueSignals[userId] = row;
        }
      });

      setActiveSignals(Object.values(uniqueSignals));
      addLog(`✨ Synchronized ${Object.keys(uniqueSignals).length} active tracking targets.`);
    };

    fetchLiveLocations();

    // 2. Realtime listener layer channel subscription to stream updates without reloading pages
    const trackingChannel = supabase
      .channel('gps-surveillance-stream')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'gps_telemetry' },
        async (payload) => {
          addLog(`⚡ Incoming telemetry packet intercepted from Profile ID: ${payload.new.profile_id}`);
          
          // Re-fetch mapping properties data matrix for the new point parameters
          const { data: updatedPoint } = await supabase
            .from('gps_telemetry')
            .select(`
              id, latitude, longitude, current_status, recorded_at,
              gps_profiles ( user_id, profile_type )
            `)
            .eq('id', payload.new.id)
            .single();

          if (updatedPoint) {
            setActiveSignals((prev) => {
              const filtered = prev.filter(
                (item) => item.gps_profiles?.user_id !== (updatedPoint as any).gps_profiles?.user_id
              );
              return [updatedPoint as any, ...filtered];
            });
            addLog(`🎯 Target ${(updatedPoint as any).gps_profiles?.user_id.substring(0, 8)} updated coordinates.`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(trackingChannel);
    };
  }, []);

  return (
    <div className="p-6 bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 font-mono text-xs shadow-2xl">
      <div className="border-b border-slate-800 pb-4 mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold uppercase tracking-widest text-cyan-400">GPS Live System Surveillance Matrix</h2>
          <p className="text-slate-400 text-[10px]">Real-time tracking overview for drivers and riders</p>
        </div>
        <div className="px-3 py-1 bg-cyan-950/40 border border-cyan-800 rounded-md text-cyan-400 font-bold animate-pulse">
          LIVE SYSTEM FEED ACTIVE
        </div>
      </div>

      {/* Grid interface layout parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active systems data matrix grid listing rows */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-slate-400 uppercase font-bold tracking-wider text-[10px] mb-2">Monitored Fleet Signals ({activeSignals.length})</h3>
          
          {activeSignals.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-500">
              No active vehicle or driver telemetry signals found inside local cells.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeSignals.map((signal) => (
                <div key={signal.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-slate-200">ID: {signal.gps_profiles?.user_id.substring(0, 8)}...</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      signal.current_status === 'on_delivery' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      signal.current_status === 'on_duty' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {signal.current_status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="space-y-1 text-slate-400 text-[11px]">
                    <div>Type: <span className="text-yellow-500 font-bold uppercase">{signal.gps_profiles?.profile_type}</span></div>
                    <div className="font-bold text-cyan-500">LAT: {signal.latitude.toFixed(6)}</div>
                    <div className="font-bold text-cyan-500">LNG: {signal.longitude.toFixed(6)}</div>
                    <div className="text-[9px] text-slate-500 mt-2">Telemetry logged: {new Date(signal.recorded_at).toLocaleTimeString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live system logs interface display terminal console view */}
        <div className="flex flex-col">
          <h3 className="text-slate-400 uppercase font-bold tracking-wider text-[10px] mb-2">Surveillance Console Logs</h3>
          <div className="flex-1 p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2 min-h-[200px] overflow-y-auto text-slate-300 font-mono text-[10px]">
            {logMessages.map((log, idx) => (
              <div key={idx} className="border-b border-slate-850 pb-1 last:border-0 truncate">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
