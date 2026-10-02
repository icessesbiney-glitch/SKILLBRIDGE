import { NextRequest, NextResponse } from "next/server";

// Server-only Dodo Payments API key. Must NOT be prefixed with NEXT_PUBLIC_
// so it is never bundled into client-side JavaScript.
//
// SECURITY NOTE: A live Dodo bearer token was previously hardcoded directly in
// apps/web/components/DodoCheckoutButton.tsx and committed to git history. That
// token must be treated as compromised and rotated in the Dodo Payments
// dashboard -- it is no longer used by this route.
const DODO_API_KEY = process.env.DODO_API_KEY;

export async function POST(req: NextRequest) {
  if (!DODO_API_KEY) {
    return NextResponse.json(
      { error: "Dodo Payments is not configured on the server (missing DODO_API_KEY)." },
      { status: 500 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));

    const response = await fetch("https://dodopayments.com", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + DODO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_cart: [{ product_id: "pdt_live_default", quantity: 1 }],
        customer: { email: body.email ?? "test@acme.com", name: body.name ?? "Joshua Biney" },
        billing: { country: body.country ?? "GH" },
        return_url: "https://skillbridge-nine-mu.vercel.app",
      }),
    });

    const sessionData = await response.json().catch(() => null);

    if (sessionData?.checkout_url) {
      return NextResponse.json({ checkout_url: sessionData.checkout_url });
    }

    return NextResponse.json(
      { error: "Live mode active. Waiting for Dodo compliance approval status to initialize public link." },
      { status: 502 }
    );
  } catch (error) {
    console.error("Dodo checkout session error:", error);
    return NextResponse.json({ error: "Failed to create Dodo checkout session." }, { status: 500 });
  }
}
