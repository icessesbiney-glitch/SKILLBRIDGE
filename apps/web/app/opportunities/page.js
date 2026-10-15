'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://aolfuonsuaeoitumuvqc.supabase.co', 'sb_publishable_f21PTSo3zKr1oayFCTTyxA_yn6C7QKo');

export default function OpportunitiesHubPage() {
  const [profile, setProfile] = useState({ path: null, modules: [] });
  const [loading, setLoading] = useState(true);

  const jobs = [
    { id: "J_01", title: "Lead Ledger Reconciliation Engineer", pathReq: "PATH_DEV", minModules: 2, rate: "4,500 GHS / Month", location: "Accra Corporate Hub" },
    { id: "J_02", title: "Real-Time Telemetry Route Dispatch Orchestrator", pathReq: "PATH_LOGISTICS", minModules: 2, rate: "5,200 GHS / Month", location: "Accra Logistics Grid" }
  ];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase.from('user_learning_profiles').select('*').eq('user_id', session.user.id).single().then(({ data }) => {
          if (data) setProfile({ path: data.selected_path, modules: data.completed_modules || [] });
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });
  }, []);

  if (loading) return <div style={{ background: '#070a13', color: '#fff', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Syncing Placements...</div>;

  return (
    <div style={{ backgroundColor: '#070a13', color: '#f1f5f9', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', padding: '32px' }}>
      <header style={{ borderBottom: '1px solid #1e293b', paddingBottom: '20px', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>CONNECTED LIVE JOB MARKET PLACEMENTS</h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Real positions unlocked based on verified course modules completion criteria.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        {jobs.map(job => {
          const match = (profile.path === job.pathReq) && (profile.modules.length >= job.minModules);
          return (
            <div key={job.id} style={{ backgroundColor: '#0f1322', padding: '24px', borderRadius: '12px', border: match ? '1px solid #10b981' : '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: match ? '#fff' : '#94a3b8' }}>{job.title}</h3>
                <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#64748b' }}>Accra Cluster Focus | Payout: {job.rate}</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#475569' }}>Prerequisites: 2 Pathway Module Audits Verified</p>
              </div>
              <div>
                {match ? (
                  <button style={{ backgroundColor: '#10b981', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>APPLY IMMEDIATELY</button>
                ) : (
                  <span style={{ fontSize: '12px', color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '6px 14px', borderRadius: '6px', fontWeight: '700' }}>LOCKED: PENDING AUDITS</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
