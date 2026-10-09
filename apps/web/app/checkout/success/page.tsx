"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || "N/A";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "sans-serif", backgroundColor: "#f9fafb", padding: "20px" }}>
      <div style={{ backgroundColor: "#ffffff", padding: "40px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", textAlign: "center", maxWidth: "450px", width: "100%" }}>
        <div style={{ width: "64px", height: "64px", backgroundColor: "#d1fae5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <span style={{ color: "#059669", fontSize: "32px", fontWeight: "bold" }}>✓</span>
        </div>
        <h1 style={{ fontSize: "24px", color: "#111827", marginBottom: "8px", fontWeight: "bold" }}>Payment Successful!</h1>
        <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "24px" }}>Thank you for your business. Your payment transaction has been processed completely.</p>
        <div style={{ backgroundColor: "#f3f4f6", padding: "12px", borderRadius: "8px", fontSize: "13px", color: "#4b5563", marginBottom: "32px", textAlign: "left" }}>
          <strong>Paystack Reference:</strong> <span style={{ fontFamily: "monospace" }}>{reference}</span>
        </div>
        <Link href="/dashboard" style={{ display: "block", backgroundColor: "#0284c7", color: "#ffffff", padding: "12px 24px", borderRadius: "8px", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>
          Go to Dashboard Layout
        </Link>
      </div>
    </div>
  );
}
