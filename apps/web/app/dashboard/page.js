'use client';
import React, { useState, useEffect } from 'react';

export default function AdvancedDashboardPage() {
  const [systemTime, setSystemTime] = useState('17:12:00 GMT');
  const [metrics, setMetrics] = useState({ poolLeases: 12, capacity: '26.6%' });
  const [riders, setRiders] = useState([
    { id: 'RIDER_TRACK_0412', label: '0412', status: 'ACTIVE', speed: 42.5, lat: 5.6037, lng: -0.1870, location: 'Accra Central' },
    { id: 'RIDER_TRACK_0822', label: '0822', status: 'ACTIVE', speed: 18.2, lat: 5.6142, lng: -0.2011, location: 'Airport Residential' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemTime(new Date().toTimeString().split(' ')[0] + ' GMT');
      setRiders(prev => prev.map(r => ({
        ...r,
        lat: parseFloat((r.lat + (Math.random() - 0.5) * 0.001).toFixed(4)),
        lng: parseFloat((r.lng + (Math.random() - 0.5) * 0.001).toFixed(4)),
        speed: parseFloat(Math.max(10, Math.min(60, r.speed + (Math.random() - 0.5) * 2)).toFixed(1))
      })));
      setMetrics(prev => {
        const nextPools = Math.max(10, Math.min(35, prev.poolLeases + (Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0)));
        return { poolLeases: nextPools, capacity: ((nextPools / 45) * 100).toFixed(1) + '%' };
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ backgroundColor: '#070a13', color: '#f1f5f9', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', padding: '24px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '20px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', margin: 0 }}>SKILLBRIDGE MASTER SUITE</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Hyperlocal Tracking Routing & Ledger Stream Orchestration</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ backgroundColor: '#111827', padding: '8px 16px', borderRadius: '8px', border: '1px solid #1e293b', fontSize: '13px', fontFamily: 'monospace' }}>Pulse: {systemTime}</div>
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '8px 16px', borderRadius: '8px', border: '1px solid #10b981', color: '#10b981', fontSize: '13px', fontWeight: '600' }}>SUPABASE LIVE NODE</div>
        </div>
      </header>
      <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '24px' }}>
        <div>
          <div style={{ backgroundColor: '#0f1322', borderRadius: '12px', border: '1px solid #1e293b', padding: '24px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 16px 0' }}>?? Real-Time GPS Tracking Map Grid</h2>
            <div style={{ height: '360px', backgroundColor: '#070a13', borderRadius: '10px', border: '1px solid #243249', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'linear-gradient(rgba(30,41,59,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(30,41,59,0.3) 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
              {riders.map((r, i) => (
                <div key={r.id} style={{ position: 'absolute', top: i === 0 ? '42%' : '58%', left: i === 0 ? '38%' : '52%', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1.5px solid #10b981', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', color: '#10b981', fontWeight: '700', boxShadow: '0 0 12px rgba(16, 185, 129, 0.2)' }}>
                  ??? RIDER-{r.label} ({r.speed} km/h)
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div style={{ backgroundColor: '#0f1322', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>ACTIVE LEASES</span>
              <p style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: '900', color: '#10b981' }}>{metrics.poolLeases} / 45</p>
            </div>
            <div style={{ backgroundColor: '#0f1322', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>ROUTER LOAD</span>
              <p style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: '900', color: '#3b82f6' }}>{metrics.capacity}</p>
            </div>
            <div style={{ backgroundColor: '#0f1322', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>PAYSTACK MODALITY</span>
              <p style={{ margin: '8px 0 0 0', fontSize: '20px', fontWeight: '900', color: '#f59e0b' }}>REAL PROD MODE</p>
            </div>
          </div>
        </div>
        <div style={{ backgroundColor: '#0f1322', borderRadius: '12px', border: '1px solid #1e293b', padding: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 16px 0', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>Telemetry Stream</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {riders.map(r => (
              <div key={r.id} style={{ backgroundColor: '#070a13', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', color: '#3b82f6' }}><span>{r.id}</span><span style={{ color: '#10b981' }}>{r.status}</span></div>
                <p style={{ margin: '4px 0 0 0', color: '#94a3b8' }}>Focus: {r.location}</p>
                <p style={{ margin: '2px 0 0 0', color: '#64748b', fontFamily: 'monospace' }}>{r.lat}, {r.lng} ({r.speed} kph)</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
