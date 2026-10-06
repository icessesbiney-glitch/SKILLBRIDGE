import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!secretKey) {
      return NextResponse.json({ error: "Paystack secret key is not configured." }, { status: 500 });
    }

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Supabase configuration is incomplete." }, { status: 500 });
    }

    const signature = req.headers.get("x-paystack-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing verification headers." }, { status: 401 });
    }

    const rawBody = await req.text();
    const expectedSignature = crypto.createHmac("sha512", secretKey).update(rawBody).digest("hex");

    const signaturesMatch = signature.length === expectedSignature.length && 
      crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));

    if (!signaturesMatch) {
      return NextResponse.json({ error: "Signature verification failed." }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // ==========================================
    // CASE 1: Inbound Deposit Succeeded
    // ==========================================
    if (body.event === "charge.success") {
      const payment = body.data;
      const reference = payment.reference;
      const amount = Number(payment.amount || 0) / 100;

      if (!reference) {
        return NextResponse.json({ error: "Missing reference tracker parameter." }, { status: 400 });
      }

      const { data: txRecord, error: lookError } = await supabase
        .from("paystack_transactions")
        .select("id, user_id, status")
        .eq("reference", reference)
        .maybeSingle();

      if (lookError || !txRecord) {
        console.error("Payment target matching missed:", lookError || "Not found");
        return NextResponse.json({ error: "Payment lookup target unresolvable." }, { status: 200 });
      }

      if (txRecord.status === "success") {
        return NextResponse.json({ received: true, info: "Duplicate notification ignored." });
      }

      // Update the transaction log status
      const { error: txUpdateError } = await supabase
        .from("paystack_transactions")
        .update({
          status: "success",
          paystack_transaction_id: payment.id ?? null,
          paid_at: payment.paid_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", txRecord.id);

      if (txUpdateError) {
        console.error("Transaction status update failed:", txUpdateError);
        return NextResponse.json({ error: "Database lock failed on logging transaction status." }, { status: 500 });
      }

      // ATOMIC WALLET UPDATE: Increment the client balance
      const { data: currentWallet, error: fetchWalletErr } = await supabase
        .from("platform_wallets")
        .select("available_balance, total_earnings")
        .eq("user_id", txRecord.user_id)
        .maybeSingle();

      if (!fetchWalletErr && currentWallet) {
        const nextBalance = Number(currentWallet.available_balance || 0) + amount;
        const nextEarnings = Number(currentWallet.total_earnings || 0) + amount;

        await supabase
          .from("platform_wallets")
          .update({
            available_balance: nextBalance,
            total_earnings: nextEarnings,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", txRecord.user_id);
      }
      
      console.log(`[DEPOSIT CONFIRMED] Wallet Credited: User ${txRecord.user_id} + GHS ${amount}`);
    }

    // ==========================================
    // CASE 2: Outbound Transfer/Withdrawal Failed
    // ==========================================
    if (body.event === "transfer.failed" || body.event === "transfer.reversed") {
      const transfer = body.data;
      const originalReason = transfer.reason || "";
      
      // Extract User ID string pattern matching from transfer payload
      const userIdMatch = originalReason.match(/User ID:\s*([a-f0-9-]{36})/i);
      const userId = userIdMatch ? userIdMatch[1] : null;
      const refundAmount = Number(transfer.amount || 0) / 100;

      if (userId) {
        const { data: wallet, error: walletFetchErr } = await supabase
          .from("platform_wallets")
          .select("available_balance")
          .eq("user_id", userId)
          .maybeSingle();

        if (!walletFetchErr && wallet) {
          const restoredBalance = Number(wallet.available_balance || 0) + refundAmount;
          await supabase
            .from("platform_wallets")
            .update({ available_balance: restoredBalance })
            .eq("user_id", userId);
          
          console.warn(`[WITHDRAWAL REVERSED] Transfer failed via Paystack. Refunded GHS ${refundAmount} to User ${userId}`);
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook endpoint runtime crash:", error);
    return NextResponse.json({ error: "Internal crash processing asynchronous paystack ledger hooks." }, { status: 500 });
  }
}
