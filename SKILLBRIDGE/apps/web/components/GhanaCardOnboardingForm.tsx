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

    const ghanaCardRegex = /^GHA-\d{9}-\d$/;
    if (!ghanaCardRegex.test(formData.ghanaCardPin)) {
      setStatus({ loading: false, success: false, error: 'Invalid Ghana Card PIN. Pattern: GHA-123456789-0' });
      return;
    }

    if (formData.phoneNumber.length < 10) {
      setStatus({ loading: false, success: false, error: 'Enter a valid 10-digit phone number.' });
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/migration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Compliance validation failed.');
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
          <label className="block text-xs font-semibold text-gray-600 mb-1">Full Legal Name</label>
          <input type="text" name="fullName" required value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg text-sm" placeholder="Joshua Biney" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number</label>
          <input type="tel" name="phoneNumber" required value={formData.phoneNumber} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg text-sm" placeholder="0241234567" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Ghana Card PIN</label>
          <input type="text" name="ghanaCardPin" required value={formData.ghanaCardPin} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg text-sm" placeholder="GHA-123456789-0" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Account Tier</label>
          <select name="roleTier" value={formData.roleTier} onChange={handleInputChange} className="w-full px-4 py-2 bg-white border rounded-lg text-sm">
            <option value="customer">Standard Customer</option>
            <option value="vendor_micro">Micro Vendor</option>
            <option value="vendor_elite">Elite Wholesaler</option>
            <option value="driver_rider">Logistics Rider</option>
          </select>
        </div>
        {status.error && <div className="p-3 text-xs bg-red-50 text-red-600 rounded-lg">{status.error}</div>}
        {status.success && <div className="p-3 text-xs bg-emerald-50 text-emerald-700 rounded-lg">Verification complete!</div>}
        <button type="submit" disabled={status.loading} className="w-full py-2.5 bg-emerald-600 text-white font-medium rounded-lg text-sm">
          {status.loading ? 'Processing...' : 'Submit Records'}
        </button>
      </form>
    </div>
  );
}
