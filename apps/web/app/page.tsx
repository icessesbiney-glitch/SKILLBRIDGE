import React from "react";
import DodoCheckoutButton from "../components/DodoCheckoutButton";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 border border-gray-100">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">SkillBridge Live Test Environment</h1>
        <p className="text-gray-500 mb-6">Verify your end-to-end sandbox purchase and webhook ledger automations instantly.</p>
        
        <div className="p-4 bg-gray-50 rounded-lg mb-6 text-left border border-gray-200">
          <div className="flex justify-between font-medium text-sm text-gray-600 mb-1">
            <span>Product Item:</span>
            <span>Advanced Dev Tier Package</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900">
            <span>Total Value Charge:</span>
            <span>$400.00 USD</span>
          </div>
        </div>

        {/* Mounts your live transaction button wrapper directly onto the page grid */}
        <DodoCheckoutButton />
      </div>
    </div>
  );
}
