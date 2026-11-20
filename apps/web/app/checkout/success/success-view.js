"use client";

import { useSearchParams } from "next/navigation";

export default function SuccessViewContainer() {
  const searchParams = useSearchParams();
  const reference = searchParams ? searchParams.get("reference") : "N/A";

  return (
    <div className="p-6 max-w-md mx-auto text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment status pending</h1>
      <p className="text-gray-600 mb-4">
        Paystack is processing your payment. Your wallet will update after the server confirms the transaction.
      </p>
      <div className="bg-gray-50 p-3 rounded text-sm font-mono text-gray-500">
        Reference: {String(reference || "Not provided")}
      </div>
    </div>
  );
}
