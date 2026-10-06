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

    // Enforce matching formatting standard validation checks for Ghana NIA numbers
    const ghanaCardRegex = /^GHA-\d{9}-\d$/;
    if (!ghanaCardRegex.test(formData.ghanaCardPin)) {
      setStatus({ loading: false, success: false, error: 'Invalid Ghana Card number format. Use structural scheme pattern: GHA-123456789-0' });
      return;
    }

    // Verify phone configuration numbers match standard local carrier criteria length limits
    if (formData.phoneNumber.length 
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Legal Identity Verification</h2>
      <p className="text-sm text-gray-500 mb-6">Complete identity checks to unlock verified live marketplace balances.</p>
      
      <form onSubmit={executeRegistration} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Full Legal Name (Ghana Card exact match)</label>
          <input type="text" name="fullName" required value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm" placeholder="Joshua Biney" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Local Network Account Telephone</label>
          <input type="tel" name="phoneNumber" required value={formData.phoneNumber} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm" placeholder="0241234567" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Ghana Card PIN Number</label>
          <input type="text" name="ghanaCardPin" required value={formData.ghanaCardPin} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm" placeholder="GHA-123456789-0" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Desired Registration Tier</label>
          <select name="roleTier" value={formData.roleTier} onChange={handleInputChange} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm">
            <option value="customer">Standard Customer Profile</option>
            <option value="vendor_micro">Micro-Scale Local Vendor</option>
            <option value="vendor_elite">Elite Wholesaler / Distributor</option>
            <option value="driver_rider">Independent Logistics Rider</option>
          </select>
        </div>

        {status.error && <div className="p-3 text-xs bg-red-50 text-red-600 rounded-lg font-medium">{status.error}</div>}
        {status.success && <div className="p-3 text-xs bg-emerald-50 text-emerald-700 rounded-lg font-medium">Compliance verification records processed perfectly!</div>}

        <button type="submit" disabled={status.loading} className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-medium rounded-lg text-sm transition duration-150">
          {status.loading ? 'Encrypting Legal Structs...' : 'Submit Verification Records'}
        </button>
      </form>
    </div>
  );
}
