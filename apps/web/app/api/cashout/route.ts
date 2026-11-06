import { NextRequest, NextResponse } from "next/server";
import { adminClient, authenticate } from "../_lib/auth";

const PAYSTACK = "https://api.paystack.co";

export async function POST(req: NextRequest) {
  try {
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    const admin = adminClient();
    if (!admin || !paystackSecretKey) {
      return NextResponse.json({ error: "Server configurations are incomplete." }, { status: 500 });
    }

    const auth = await authenticate(req);
    if ("error" in auth) return auth.error;
    const userId = auth.user.id;

    const { amount, bankCode, accountNumber, accountName } = await req.json();
    if (!amount || !bankCode || !accountNumber || !accountName) {
      return NextResponse.json({ error: "Missing required cashout payload elements." }, { status: 400 });
    }

    const amountCents = Math.round(Number(amount) * 100);
    if (!Number.isInteger(amountCents) || amountCents < 5000) {
      return NextResponse.json({ error: "Minimum cashout is GHS 50." }, { status: 400 });
    }

    const reference = `cashout_${crypto.randomUUID()}`;

    // Debit first, atomically, so concurrent requests cannot overspend the wallet.
    const { data: debit, error: debitError } = await admin.rpc("execute_wallet_withdrawal", {
      target_profile_id: userId,
      requested_amount_cents: amountCents,
      payment_reference: reference,
    });
    if (debitError || !debit?.success) {
      return NextResponse.json({ error: debit?.error || "Wallet debit rejected." }, { status: 400 });
    }

    const refund = () =>
      admin.rpc("reverse_wallet_withdrawal", {
        target_profile_id: userId,
        returned_amount_cents: amountCents,
        failed_reference: reference,
      });

    const headers = { Authorization: `Bearer ${paystackSecretKey}`, "Content-Type": "application/json" };

    try {
      const recipientRes = await fetch(`${PAYSTACK}/transferrecipient`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          type: ["MTN", "VOD", "ATL"].includes(String(bankCode).toUpperCase()) ? "mobile_money" : "ghipss",
          name: accountName,
          account_number: accountNumber,
          bank_code: bankCode,
          currency: "GHS",
        }),
      });
      const recipient = await recipientRes.json();
      if (!recipientRes.ok || !recipient.status) throw new Error(recipient.message || "Recipient creation failed.");

      const transferRes = await fetch(`${PAYSTACK}/transfer`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          source: "balance",
          amount: String(amountCents),
          recipient: recipient.data.recipient_code,
          reason: "SkillBridge cashout",
          currency: "GHS",
          reference,
        }),
      });
      const transfer = await transferRes.json();
      if (!transferRes.ok || !transfer.status) throw new Error(transfer.message || "Transfer rejected.");

      return NextResponse.json({
        success: true,
        message: "Cashout submitted.",
        remainingBalanceCents: debit.remaining_balance_cents,
        reference,
        transferCode: transfer.data.transfer_code,
      });
    } catch (err) {
      await refund();
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Cashout failed. Your balance was restored." },
        { status: 502 }
      );
    }
  } catch {
    return NextResponse.json({ error: "Internal payment handler error." }, { status: 500 });
  }
}
