"use client";

import { useSearchParams } from "next/navigation";

export default function SuccessViewContainer() {
  const searchParams = useSearchParams();
  const reference = searchParams?.get("reference");

  return (
    <main className="mx-auto max-w-md p-6 text-center">
      <h1 className="mb-2 text-2xl font-bold">Payment submitted</h1>
      <p className="mb-4 text-gray-600">
        Your payment is awaiting server-side confirmation. Your wallet will
        update only after the payment has been verified and processed.
      </p>
      {reference ? (
        <div className="break-all rounded bg-gray-50 p-3 font-mono text-sm text-gray-500">
          Reference: {reference}
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          No payment reference was provided in the return URL.
        </p>
      )}
    </main>
  );
}