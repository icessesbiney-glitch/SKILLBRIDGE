'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://aolfuonsuaeoitumuvqc.supabase.co', 'sb_publishable_f21PTSo3zKr1oayFCTTyxA_yn6C7QKo');

export default function CoursesPortalPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState([]);
  const [balance, setBalance] = useState(0.00);

  const courses = [
    { id: "C_DEV_01", name: "Prisma Layer & Row Level Security Mapping", value: 30, path: "Material Vendor Hubs" },
    { id: "C_DEV_02", name: "Paystack Transaction Ledger Stream Processing", value: 50, path: "Material Vendor Hubs" },
    { id: "C_LOG_01", name: "Accra Fleet Active GPS Coordination", value: 40, path: "Logistics Fleet" },
    { id: "C_LOG_02", name: "Database Pool Connection Threshold Auditing", value: 45, path: "Logistics Fleet" }
  ];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) fetchProgress(session.user.id);
      else setLoading(false);
    });
  }, []);

  const fetchProgress = async (userId) => {
    const { data } = await supabase.from('user_learning_profiles').select('*').eq('user_id', userId).single();
    if (data) {
      setCompleted(data.completed_modules || []);
      setBalance(data.wallet_balance || 0.00);
    }
    setLoading(false);
  };

  const executeModuleAudit = async (courseId, valueGHS) => {
    if (!completed.includes(courseId)) {
      const updatedModules = [...completed, courseId];
      const updatedBalance = balance + valueGHS;
      setCompleted(updatedModules);
      setBalance(updatedBalance);
      if (user) {
        await supabase.from('user_learning_profiles').update({ completed_modules: updatedModules, wallet_balance: updatedBalance }).eq('user_id', user.id);
      }
    }
  };

  if (loading) return <div style={{ background: '#070a13', color: '#fff', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Synchronizing Live Metrics...</div>;

  return (
    <div style={{ backgroundColor: '#070a13', color: '#f1f5f9', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', padding: '32px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '20px', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>📚 SKILLBRIDGE SYSTEM CURRICULUM</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Complete system audits to increase live wallet parameters natively.</p>
        </div>
        <div style={{ backgroundColor: '#0f1322', border: '1px solid #243249', padding: '12px 24px', borderRadius: '10px', textAlign: 'right' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>ACCUMULATED BALANCE</span>
          <p style={{ margin: '4px 0 0 0', fontSize: '22px', fontWeight: '900', color: '#10b981', fontFamily: 'monospace' }}>{balance.toFixed(2)} GHS</p>
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {courses.map(course => {
          const isDone = completed.includes(course.id);
          return (
            <div key={course.id} style={{ backgroundColor: '#0f1322', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>{course.path}</span>
                <h3 style={{ margin: '8px 0 4px 0', fontSize: '16px', fontWeight: '700' }}>{course.name}</h3>
                <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '600' }}>🎁 Direct Payout: {course.value}.00 GHS</span>
              </div>
              <button onClick={() => executeModuleAudit(course.id, course.value)} disabled={isDone} style={{ backgroundColor: isDone ? 'rgba(16, 185, 129, 0.1)' : '#3b82f6', color: isDone ? '#10b981' : '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: isDone ? 'default' : 'pointer' }}>
                {isDone ? '✓ VERIFIED' : 'RUN MODULE AUDIT'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}