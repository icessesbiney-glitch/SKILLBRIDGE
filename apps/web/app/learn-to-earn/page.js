'use client';
import React, { useState, useEffect } from 'react';

export default function LearnToEarnPreHub() {
  const [balance, setMetricsBalance] = useState(0.00);
  const [activeSubject, setActiveSubject] = useState(0);
  const [completedModules, setCompletedModules] = useState([]);

  const subjects = [
    {
      id: "SUB_01",
      title: "Foundational Distributed Ledgers & Consensus Parity",
      description: "Master baseline transactional cryptographic consensus principles before accessing live material dealership categories.",
      estimatedMinutes: 45,
      rewardValue: "25.00 GHS",
      modules: [
        "1.1 Introduction to Asset Ledger States",
        "1.2 Cryptographic Verifications & Signatures",
        "1.3 Row-Level Token Auth Security Controls",
        "1.4 Practical Consensus Verification Simulation"
      ]
    },
    {
      id: "SUB_02",
      title: "Hyperlocal Delivery Network Topology",
      description: "Understand telemetry stream synchronization, edge routing parameters, and pool lease thresholds for real-time Accra clusters.",
      estimatedMinutes: 60,
      rewardValue: "40.00 GHS",
      modules: [
        "2.1 Telemetry Request Lifecycle Boundaries",
        "2.2 Real-time Active Rider Location Mapping",
        "2.3 Managing Database Pool Connections Load",
        "2.4 Edge Router Threshold Failover Recovery"
      ]
    }
  ];

  const handleModuleComplete = (moduleName, reward) => {
    if (!completedModules.includes(moduleName)) {
      setCompletedModules([...completedModules, moduleName]);
      const rewardValueNum = parseFloat(reward.split(' ')[0]);
      setMetricsBalance(prev => prev + (rewardValueNum / 4));
    }
  };

  return (
    <div style={{ backgroundColor: '#070a13', color: '#f1f5f9', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', padding: '32px' }}>
      {/* Subject Hub Header banner */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '20px', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ backgroundColor: '#3b82f6', color: '#fff', fontSize: '11px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px' }}>PHASE 1</span>
            <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>LEARN-TO-EARN FOUNDATION PORTAL</h1>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Complete required validation subjects to unlock decentralized vendor clusters.</p>
        </div>

        {/* Live Reward Balance Wallet Mock widget */}
        <div style={{ backgroundColor: '#0f1322', border: '1px solid #243249', borderRadius: '10px', padding: '12px 24px', textAlign: 'right' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>ACCUMULATED WALLET REWARD</span>
          <p style={{ margin: '4px 0 0 0', fontSize: '22px', fontWeight: '900', color: '#10b981', fontFamily: 'monospace' }}>{balance.toFixed(2)} GHS</p>
        </div>
      </header>

      {/* Main Framework Content Grid split layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>

        {/* Left column element: Active Curriculum Syllabus parameters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: '#94a3b8' }}>Select Core Prerequisite Subject</h2>

          {subjects.map((sub, index) => (
            <div
              key={sub.id}
              onClick={() => setActiveSubject(index)}
              style={{
                backgroundColor: '#0f1322',
                borderRadius: '12px',
                border: activeSubject === index ? '2px solid #3b82f6' : '1px solid #1e293b',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#3b82f6', fontWeight: '700', fontFamily: 'monospace' }}>{sub.id}</span>
                <span style={{ fontSize: '12px', color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>🎁 Est: {sub.rewardValue}</span>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 8px 0', color: '#f1f5f9' }}>{sub.title}</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>{sub.description}</p>
            </div>
          ))}
        </div>

        {/* Right column element: Interactive Module Verification Sandbox panel logs */}
        <div style={{ backgroundColor: '#0f1322', borderRadius: '12px', border: '1px solid #1e293b', padding: '24px' }}>
          <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: '14px', marginBottom: '16px' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>ACTIVE COURSE CURRICULUM SYLLABUS</span>
            <h3 style={{ fontSize: '15px', fontWeight: '700', margin: '4px 0 0 0' }}>{subjects[activeSubject].title}</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {subjects[activeSubject].modules.map((mod) => {
              const isCompleted = completedModules.includes(mod);
              return (
                <div key={mod} style={{ backgroundColor: '#070a13', padding: '16px', borderRadius: '8px', border: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: isCompleted ? '#64748b' : '#f1f5f9', textDecoration: isCompleted ? 'line-through' : 'none' }}>{mod}</span>
                  <button
                    onClick={() => handleModuleComplete(mod, subjects[activeSubject].rewardValue)}
                    disabled={isCompleted}
                    style={{
                      backgroundColor: isCompleted ? 'rgba(16, 185, 129, 0.1)' : '#3b82f6',
                      color: isCompleted ? '#10b981' : '#fff',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: isCompleted ? 'default' : 'pointer'
                    }}
                  >
                    {isCompleted ? '✓ VERIFIED' : 'RUN AUDIT'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}