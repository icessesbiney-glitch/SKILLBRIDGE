"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AdminComplianceDashboard() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const fetchLiveRegistry = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message || 'Database connection loss.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveRegistry();
  }, []);

  const updateProfileStatus = async (id: string, nextStatus: 'verified' | 'suspended') => {
    setAlert({ type: 'info', message: 'Syncing status metrics directly with Supabase registry...' });
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ verification: nextStatus })
        .eq('id', id);

      if (error) throw error;
      
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, verification: nextStatus } : p));
      setAlert({ type: 'success', message: `Profile identity successfully marked as ${nextStatus}!` });
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message || 'Database write operation rejected.' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Central Compliance Registry</h1>
          <p className="text-sm text-gray-500">Review legal documentation hashes, evaluate vendor networks, and manage verification flags.</p>
        </header>

        {alert.message && (
          <div className={`p-4 mb-4 text-sm font-medium rounded-lg ${alert.type === 'success' ? 'bg-emerald-50 text-emerald-800' : alert.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'}`}>
            {alert.message}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="p-4">Legal Name</th>
                <th className="p-4">Telephone</th>
                <th className="p-4">Account Tier</th>
                <th className="p-4">National ID Hash</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
              {loading ? (
                <tr><td colSpan={6} className="p-4 text-center text-gray-400">Fetching live compliance metrics...</td></tr>
              ) : profiles.length === 0 ? (
                <tr><td colSpan={6} className="p-4 text-center text-gray-400">No verification records queued.</td></tr>
              ) : profiles.map((profile) => (
                <tr key={profile.id} className="hover:bg-gray-50/70 transition duration-100">
                  <td className="p-4 font-medium text-gray-900">{profile.legal_name}</td>
                  <td className="p-4">{profile.phone_number}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 uppercase">
                      {profile.role_tier ? profile.role_tier.replace('_', ' ') : 'customer'}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-xs text-gray-400">{profile.national_id_hash || 'No hash recorded'}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase ${profile.verification === 'verified' ? 'bg-emerald-50 text-emerald-700' : profile.verification === 'suspended' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                      {profile.verification || 'pending'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2 whitespace-nowrap">
                    {profile.verification === 'pending' && (
                      <>
                        <button onClick={() => updateProfileStatus(profile.id, 'verified')} className="px-3 py-1 bg-emerald-600 text-white text-xs font-medium rounded-md">Approve</button>
                        <button onClick={() => updateProfileStatus(profile.id, 'suspended')} className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded-md">Suspend</button>
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
