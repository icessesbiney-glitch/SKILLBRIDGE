"use client";

import React, { useState } from 'react';

export default function GhanaCardOnboardingForm() {
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

  const executeRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: '' });

    // Validate standard format matches exactly with NIA requirements
    const ghanaCardRegex = /^GHA-\d{9}-\d$/;
    if (!ghanaCardRegex.test(formData.ghanaCardPin)) {
      setStatus({ loading: false, success: false, error: 'Invalid Ghana Card number format. Use pattern: GHA-123456789-0' });
      return;
    }

    if (formData.phoneNumber.length < 10) {
      setStatus({ loading: false, success: false, error: 'Please enter a valid 10-digit telephone connection link.' });
      return;
    }

    try {
      const response = await fetch('/api/migration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Compliance validation failed.');
      setStatus({ loading: false, success: true, error: '' });
    } catch (err: any) {
      setStatus({ loading: false, success: false, error: err.message || 'Server timeout error.' });
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 bg-white p-8 rounded-xl shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Legal Identity Verification</h2>
      <p className="text-sm text-gray-500 mb-6">Complete verification checks to secure active store balances.</p>
      
      <form onSubmit={executeRegistration} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Full Legal Name</label>
          <input type="text" name="fullName" required value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Joshua Biney" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Mobile Money Phone Number</label>
          <input type="tel" name="phoneNumber" required value={formData.phoneNumber} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" placeholder="0241234567" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Ghana Card PIN (National ID)</label>
          <input type="text" name="ghanaCardPin" required value={formData.ghanaCardPin} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" placeholder="GHA-123456789-0" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Account Marketplace Tier</label>
          <select name="roleTier" value={formData.roleTier} onChange={handleInputChange} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm">
            <option value="customer">Standard Customer Profile</option>
            <option value="vendor_micro">Micro-Scale Local Vendor</option>
            <option value="vendor_elite">Elite Wholesaler / Distributor</option>
            <option value="driver_rider">Independent Logistics Rider</option>
          </select>
        </div>

        {status.error && <div className="p-3 text-xs bg-red-50 text-red-600 rounded-lg">{status.error}</div>}
        {status.success && <div className="p-3 text-xs bg-emerald-50 text-emerald-700 rounded-lg">Identity checks fully executed!</div>}

        <button type="submit" disabled={status.loading} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm">
          {status.loading ? 'Encrypting Details...' : 'Submit Records'}
        </button>
      </form>
    </div>
  );
}
