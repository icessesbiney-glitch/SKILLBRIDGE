import React from 'react';
import DashboardMap from '../components/DashboardMap';

export default function Page() {
  const mockRiders = [
    { id: '1', name: 'Kwame Mensah', rider_id: 'RD-2026-01', status: 'active', battery_percentage: 88 },
    { id: '2', name: 'Ama Serwaa', rider_id: 'RD-2026-02', status: 'offline', battery_percentage: 42 }
  ];

  return (
    <main className="min-h-screen bg-slate-950 p-6 flex flex-col justify-center items-center">
      <div className="w-full max-w-4xl border border-slate-900 rounded-2xl overflow-hidden shadow-2xl">
        <DashboardMap riders={mockRiders} isLoading={false} />
      </div>
    </main>
  );
}
