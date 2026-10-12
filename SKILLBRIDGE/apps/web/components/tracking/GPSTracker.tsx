'use client';

import { useEffect, useState } from 'react';

interface GPSTrackerProps {
  userId: string;
  profileType: 'driver' | 'rider';
}

export default function GPSTracker({ userId, profileType }: GPSTrackerProps) {
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [currentStatus, setCurrentStatus] = useState<string>('on_duty');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [systemMessage, setSystemMessage] = useState<string>('');

  useEffect(() => {
    let watchId: number | null = null;

    if (isTracking && typeof window !== 'undefined' && navigator.geolocation) {
      setSystemMessage('📡 Querying satellite telemetry streams...');
      
      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCoordinates({ lat: latitude, lng: longitude });

          try {
            const response = await fetch('/api/gps', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId,
                profileType,
                latitude,
                longitude,
                status: currentStatus,
              }),
            });

            if (!response.ok) throw new Error('API routing synchronization failed');
            setSystemMessage(`✅ [SYNC]: Telemetry verified at ${new Date().toLocaleTimeString()}`);
          } catch (err: any) {
            setSystemMessage(`❌ [SYNC ERROR]: ${err.message}`);
          }
        },
        (error) => {
          setSystemMessage(`❌ [PERMISSIONS ERROR]: ${error.message}`);
          setIsTracking(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    }

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [isTracking, currentStatus, userId, profileType]);

  return (
    <div className="p-6 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-800 font-mono text-xs max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold uppercase tracking-wider text-sm text-cyan-400">GPS Status Controller</h3>
        <span className={`w-3 h-3 rounded-full ${isTracking ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
      </div>

      <div className="space-y-3 mb-6">
        <div><span className="text-slate-400">Profile Type :</span> <span className="text-yellow-400 uppercase">{profileType}</span></div>
        <div><span className="text-slate-400">Telemetry ID :</span> <span className="text-slate-300">{userId.substring(0, 8)}...</span></div>
        <div>
          <span className="text-slate-400">Coordinates:</span>{' '}
          {coordinates ? (
            <span className="text-emerald-400">{coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}</span>
          ) : (
            <span className="text-amber-400">Awaiting Signal Matrix</span>
          )}
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setIsTracking(!isTracking)}
          className={`flex-1 py-2 font-bold uppercase rounded border transition-colors ${
            isTracking 
              ? 'bg-rose-950/50 border-rose-500 text-rose-400 hover:bg-rose-900' 
              : 'bg-emerald-950/50 border-emerald-500 text-emerald-400 hover:bg-emerald-900'
          }`}
        >
          {isTracking ? 'Deactivate System Tracker' : 'Activate Live GPS Tracking'}
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {['on_duty', 'paused', 'on_delivery'].map((status) => (
          <button
            key={status}
            onClick={() => setCurrentStatus(status)}
            className={`flex-1 py-1 text-[10px] uppercase rounded border transition-all ${
              currentStatus === status 
                ? 'bg-cyan-950/50 border-cyan-400 text-cyan-400 font-bold' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="p-2 bg-slate-950 rounded text-slate-400 border border-slate-850 break-words min-h-[32px]">
        {systemMessage || 'System idle. Awaiting instruction execution matrix...'}
      </div>
    </div>
  );
}
