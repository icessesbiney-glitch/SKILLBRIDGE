import React from 'react';

export default function DashboardMap({ riders, isLoading }) {
    return (
        <div className="dashboard-container p-4 bg-slate-900 min-h-screen text-slate-100">
            <div className="map-wrapper border border-slate-800 rounded-xl overflow-hidden bg-slate-950/50 backdrop-blur-md">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="text-sm font-bold tracking-wider text-slate-400 uppercase">Real-Time Fleet Tracker</h2>
                </div>
                <div className="riders-list divide-y divide-slate-800 max-h-[600px] overflow-y-auto">
                    {isLoading ? (
                        <div className="p-8 text-center text-xs text-slate-500 animate-pulse">Loading live tracking systems...</div>
                    ) : (
                        riders && riders.map((rider) => (
                            <div key={rider.id || rider.rider_id} className="rider-card flex items-center justify-between p-3.5 hover:bg-slate-900/50 transition-colors">
                                <div className="rider-info min-w-0 flex-1 pr-4">
                                    <p className="text-xs font-semibold text-slate-200 truncate">{rider.name || 'Independent Rider'}</p>
                                    <p className="text-[10px] text-slate-500 truncate font-mono mt-0.5">{rider.rider_id || rider.id}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase `}>
                                        {rider.status || 'offline'}
                                    </span>
                                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">{rider.battery_percentage ?? 0}%</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
