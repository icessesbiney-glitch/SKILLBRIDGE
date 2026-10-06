"use client";

import React, { useState, useEffect } from 'react';

export default function AdminComplianceDashboard() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', message: '' });

  useEffect(() => {
    // Simulated live administration fetch loop payload
    setProfiles([
      { id: '1', legal_name: 'Joshua Biney', phone_number: '0241234567', role_tier: 'vendor_micro', verification: 'pending', national_id_hash: '8f7a9c...e3b2' },
      { id: '2', legal_name: 'Accra Logistics Hub', phone_number: '0559876543', role_tier: 'driver_rider', verification: 'pending', national_id_hash: '4d1e2f...a9b0' }
    ]);
    setLoading(false);
  }, []);

  const updateProfileStatus = async (id: string, nextStatus: 'verified' | 'suspended') => {
    setAlert({ type: 'info', message: 'Updating compliance records inside data layer...' });
    
    // Optimistically update administrative layout UI state records
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, verification: nextStatus } : p));
    setAlert({ type: 'success', message: `Profile registration state successfully updated to ${nextStatus}!` });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Central Compliance Registry</h1>
          <p className="text-sm text-gray-500">Review legal documentation hashes, evaluate vendor networks, and greenlight platform verification flags.</p>
        </header>

        {alert.message && (
          <div className={`p-4 mb-4 text-sm font-medium rounded-lg ${alert.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-blue-50 text-blue-800'}`}>
            {alert.message}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="p-4">Legal Identity Name</th>
                <th className="p-4">Telephone Identity</th>
                <th className="p-4">Marketplace Account Tier</th>
                <th className="p-4">Cryptographic National ID Hash</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
              {profiles.map((profile) => (
                <tr key={profile.id} className="hover:bg-gray-50/70 transition duration-100">
                  <td className="p-4 font-medium text-gray-900">{profile.legal_name}</td>
                  <td className="p-4">{profile.phone_number}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 uppercase">
                      {profile.role_tier.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-xs text-gray-400">{profile.national_id_hash}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase ${profile.verification === 'verified' ? 'bg-emerald-50 text-emerald-700' : profile.verification === 'suspended' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                      {profile.verification}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {profile.verification === 'pending' && (
                      <>
                        <button onClick={() => updateProfileStatus(profile.id, 'verified')} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-md transition">Approve</button>
                        <button onClick={() => updateProfileStatus(profile.id, 'suspended')} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-md transition">Suspend</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
