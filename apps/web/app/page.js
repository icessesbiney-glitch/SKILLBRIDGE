'use client';
import React from 'react';
export default function Page() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'sans-serif', padding: '2rem' }}>
      <header style={{ borderBottom: '1px solid #334155', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8', margin: 0 }}>SKILLBRIDGE</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Global Monorepo Hyperlocal Matrix</p>
      </header>
      <main style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #334155' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f1f5f9' }}>?? Live Payment Hub</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>Gateway Processor: <strong>Paystack Ghana API</strong></p>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.25rem' }}>Currency Profile: <strong style={{ color: '#34d399' }}>GHS (?)</strong></p>
        </div>
        <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #334155' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f1f5f9' }}>??? Telemetry Routing</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>Core Data Broker: <strong>Supabase Realtime</strong></p>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.25rem' }}>Tracking Target: <strong style={{ color: '#38bdf8' }}>GPS Driver-Rider Grid</strong></p>
        </div>
      </main>
    </div>
  );
}
