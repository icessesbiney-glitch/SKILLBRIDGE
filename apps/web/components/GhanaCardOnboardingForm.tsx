"use client";

import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import Link from 'next/link';
import { useAuthSession } from '../hooks/useAuthSession';

export default function GhanaCardOnboardingForm() {
  const { isConfigured, isLoading, session } = useAuthSession();
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    ghanaCardPin: '',
    roleTier: 'customer'
  });
  const [status, setStatus] = useState({ loading: false, success: false, error: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (isLoading) {
    return <p className="sb-card" role="status">Checking your account…</p>;
  }

  if (!isConfigured || !session?.user) {
    return (
      <div className="sb-card">
        <h2 className="text-xl font-bold text-gray-800">Account verification</h2>
        <p className="mt-2 text-sm text-gray-600">
          Sign in before entering identity or contact information.
        </p>
        <Link href="/auth" className="sb-button mt-4">Sign in to continue</Link>
      </div>
    );
  }

  const executeRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: '' });

    const ghanaCardRegex = /^GHA-\d{9}-\d$/i;
    if (!ghanaCardRegex.test(formData.ghanaCardPin.trim())) {
      setStatus({ loading: false, success: false, error: 'Enter a valid Ghana Card PIN.' });
      return;
    }

    if (!/^(?:\+?233|0)\d{9}$/.test(formData.phoneNumber.replace(/[\s-]/g, ''))) {
      setStatus({ loading: false, success: false, error: 'Enter a valid 10-digit phone number.' });
      return;
    }

    try {
      if (!supabase) throw new Error('Account services are not configured.');
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error('Please sign in before submitting verification.');

      const response = await fetch('/api/migration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Submission failed.');
      setStatus({ loading: false, success: true, error: '' });
    } catch (err: any) {
      setStatus({ loading: false, success: false, error: err.message || 'Server error.' });
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 bg-white p-8 rounded-xl shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Identity Verification</h2>
      <form onSubmit={executeRegistration} className="space-y-4">
        <div>
          <label htmlFor="legal-name" className="block text-xs font-semibold text-gray-600 mb-1">Full legal name</label>
          <input id="legal-name" type="text" name="fullName" required maxLength={200} value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg text-sm" placeholder="Your legal name" autoComplete="name" />
        </div>
        <div>
          <label htmlFor="phone-number" className="block text-xs font-semibold text-gray-600 mb-1">Phone number</label>
          <input id="phone-number" type="tel" name="phoneNumber" required maxLength={16} value={formData.phoneNumber} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg text-sm" placeholder="0241234567" autoComplete="tel" />
        </div>
        <div>
          <label htmlFor="ghana-card-pin" className="block text-xs font-semibold text-gray-600 mb-1">Ghana Card PIN</label>
          <input id="ghana-card-pin" type="password" name="ghanaCardPin" required maxLength={15} autoComplete="off" value={formData.ghanaCardPin} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg text-sm" placeholder="GHA-123456789-0" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Account Tier</label>
          <select name="roleTier" value={formData.roleTier} onChange={handleInputChange} className="w-full px-4 py-2 bg-white border rounded-lg text-sm">
            <option value="customer">Standard Customer</option>
            <option value="vendor_micro">Micro Vendor</option>
            <option value="vendor_elite">Elite Wholesaler</option>
          </select>
        </div>
        {status.error && <div className="p-3 text-xs bg-red-50 text-red-600 rounded-lg">{status.error}</div>}
        {status.success && <div className="p-3 text-xs bg-emerald-50 text-emerald-700 rounded-lg">Your information was submitted for administrator review. It has not been verified yet.</div>}
        <button type="submit" disabled={status.loading} className="w-full py-2.5 bg-emerald-600 text-white font-medium rounded-lg text-sm">
          {status.loading ? 'Submitting...' : 'Submit for review'}
        </button>
      </form>
    </div>
  );
}
