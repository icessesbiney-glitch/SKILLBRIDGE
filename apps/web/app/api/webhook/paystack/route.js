import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_f21PTSo3zKr1oayFCTTyxA_yn6C7QKo";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req) {
    try {
        const rawBody = await req.text();
        const signature = req.headers.get("x-paystack-signature");
        
        // Pulled securely from your server environment configuration
        const secret = process.env.PAYSTACK_SECRET_KEY || "sk_live_placeholder_string";

        console.log("=== PAYSTACK PRODUCTION HOOK EXECUTION ===");

        if (!signature) {
            return NextResponse.json({ error: "Missing header authorization signature" }, { status: 400 });
        }

        const computed = crypto
            .createHmac("sha512", secret)
            .update(rawBody)
            .digest("hex");

        if (computed !== signature) {
            console.log("Signature mismatch aborted.");
            return NextResponse.json({ error: "Signature validation failed" }, { status: 400 });
        }

        const payload = JSON.parse(rawBody);

        if (payload.event === "charge.success") {
            const txnData = payload.data;

            console.log("Processing successful payment reference: " + txnData.reference);

            const { data, error } = await supabase
                .from("payments")
                .insert([
                    {
                        reference: txnData.reference,
                        amount: txnData.amount / 100,
                        currency: txnData.currency,
                        status: txnData.status,
                        customer_email: txnData.customer.email,
                        processed_at: new Date().toISOString()
                    }
                ]);

            if (error) {
                console.error("Supabase insertion blocked:", error.message);
                return NextResponse.json({ error: "Database write rejection", message: error.message }, { status: 500 });
            }

            console.log("Database log stream entry committed successfully!");
        }

        return NextResponse.json({ received: true, reference: payload.data.reference }, { status: 200 });
    } catch (err) {
        console.error("Crash Encountered:", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
