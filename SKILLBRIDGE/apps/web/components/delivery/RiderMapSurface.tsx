'use client';

import { useState } from 'react';
import GPSTracker from '../tracking/GPSTracker';
import RiderRequestPrompt from './RiderRequestPrompt';

interface RiderMapSurfaceProps {
  riderUserId: string;
  riderProfileId: string;
}

export default function RiderMapSurface({ riderUserId, riderProfileId }: RiderMapSurfaceProps) {
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  return (
    <div className="p-6 bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 font-mono text-xs shadow-2xl max-w-4xl mx-auto">
      <div className="border-b border-slate-800 pb-4 mb-6">
        <h2 className="text-base font-bold uppercase tracking-widest text-emerald-400">Rider Navigation Hub Workspace</h2>
        <p className="text-slate-400 text-[10px]">Active route metrics & real-time dispatch matching modules</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Section: Live Telemetry Satellite Controller Feed */}
        <div className="md:col-span-1">
          <GPSTracker userId={riderUserId} profileType="rider" />
        </div>

        {/* Right Section: Virtual Navigation Map View Area */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col justify-center items-center text-center relative overflow-hidden min-h-[300px]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />
          
          <div className="z-10 space-y-4">
            <div className="text-4xl animate-pulse text-emerald-500">🗺️</div>
            <div className="font-bold text-slate-300 uppercase tracking-wider text-xs">Navigation System Active</div>
            <p className="text-slate-500 max-w-xs mx-auto text-[11px]">
              Watching your live tracking coordinate matrices. Turn on the GPS tracking engine on the left to receive active customer delivery assignments inside your cell boundary.
            </p>
          </div>
        </div>
      </div>

      {/* Realtime Intercept Dispatch Notification Prompt Alert */}
      <RiderRequestPrompt 
        riderProfileId={riderProfileId} 
        onAssignmentResolved={() => setRefreshTrigger(prev => prev + 1)} 
      />
    </div>
  );
}
