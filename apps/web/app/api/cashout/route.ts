import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!supabaseUrl || !supabaseServiceKey || !paystackSecretKey) {
      return NextResponse.json({ error: "Server configurations are incomplete." }, { status: 500 });
    }

    const body = await req.json();
    const { amount, bankCode, accountNumber, accountName, userId } = body;

    if (!amount || !bankCode || !accountNumber || !accountName || !userId) {
      return NextResponse.json({ error: "Missing required cashout payload elements." }, { status: 400 });
    }

    const cashoutAmount = Number(amount);
    if (!Number.isFinite(cashoutAmount) || cashoutAmount <= 0) {
      return NextResponse.json({ error: "Invalid withdrawal computation limit." }, { status: 400 });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: wallet, error: walletError } = await adminClient
      .from("platform_wallets")
      .select("available_balance")
      .eq("user_id", userId)
      .single();

    if (walletError || !wallet) {
      return NextResponse.json({ error: "Wallet lookup matching target missed." }, { status: 404 });
    }

    if (wallet.available_balance < cashoutAmount) {
      return NextResponse.json({ error: "Insufficient available wallet balance." }, { status: 400 });
    }

    const recipientRes = await fetch("https://paystack.co", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + paystackSecretKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "ghip",
        name: accountName,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: "GHS",
      }),
    });

    const recipientData = await recipientRes.json();
    if (!recipientRes.ok || !recipientData.status) {
      return NextResponse.json({ error: recipientData.message || "Recipient parsing failed." }, { status: 400 });
    }

    const transferRes = await fetch("https://paystack.co", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + paystackSecretKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: "balance",
        amount: String(Math.round(cashoutAmount * 100)),
        recipient: recipientData.data.recipient_code,
        reason: "SkillBridge Mobile Cashout for User: " + userId,
        currency: "GHS",
      }),
    });

    const transferData = await transferRes.json();
    if (!transferRes.ok || !transferData.status) {
      return NextResponse.json({ error: transferData.message || "Paystack transfer processing rejected." }, { status: 400 });
    }

    const nextBalance = wallet.available_balance - cashoutAmount;
    await adminClient
      .from("platform_wallets")
      .update({ available_balance: nextBalance })
      .eq("user_id", userId);

    return NextResponse.json({
      success: true,
      message: "Cashout disbursement tracked successfully.",
      remainingBalance: nextBalance,
      transferCode: transferData.data.transfer_code
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal payment handler runtime crash." }, { status: 500 });
  }
}