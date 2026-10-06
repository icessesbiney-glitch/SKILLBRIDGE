import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Server database configuration is incomplete." },
        { status: 500 }
      );
    }

    if (!paystackSecretKey) {
      return NextResponse.json(
        { error: "Paystack merchant secret key is missing." },
        { status: 500 }
      );
    }

    // Authenticate the user making the request
    const authorization = req.headers.get("authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authentication session required." },
        { status: 401 }
      );
    }

    const userClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: authorization } },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid or expired user session." },
        { status: 401 }
      );
    }

    // Parse incoming request payload
    const body = await req.json();
    const amount = Number(body.amount);
    const { bankCode, accountNumber, accountName } = body;

    if (!bankCode || !accountNumber || !accountName) {
      return NextResponse.json(
        { error: "Incomplete banking details. bankCode, accountNumber, and accountName are required." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid withdrawal allocation amount." },
        { status: 400 }
      );
    }

    // Initialize elevated Admin client for atomic wallet operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Check learner's existing balance
    const { data: wallet, error: walletError } = await adminClient
      .from("platform_wallets")
      .select("available_balance")
      .eq("user_id", user.id)
      .single();

    if (walletError || !wallet) {
      return NextResponse.json(
        { error: "Could not find a wallet profile associated with this account." },
        { status: 404 }
      );
    }

    if (wallet.available_balance < amount) {
      return NextResponse.json(
        { error: "Insufficient available balance to complete withdrawal requests." },
        { status: 400 }
      );
    }

    // STEP 1: Generate a Paystack Transfer Recipient Code
    const recipientResponse = await fetch("https://paystack.co", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "ghip", // Ghana Interbank Payment (handles card, bank, and mobile wallets)
        name: accountName,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: "GHS",
      }),
    });

    const recipientData = await recipientResponse.json();
    if (!recipientResponse.ok || !recipientData.status) {
      return NextResponse.json(
        { error: recipientData.message || "Failed to establish a valid transfer destination recipient." },
        { status: 400 }
      );
    }

    const recipientCode = recipientData.data.recipient_code;
    const amountInPesewas = Math.round(amount * 100);

    // STEP 2: Execute Paystack Transfer
    const transferResponse = await fetch("https://paystack.co", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: "balance",
        amount: String(amountInPesewas),
        recipient: recipientCode,
        reason: `SkillBridge Payout for User ID: ${user.id}`,
        currency: "GHS",
      }),
    });

    const transferData = await transferResponse.json();
    if (!transferResponse.ok || !transferData.status) {
      return NextResponse.json(
        { error: transferData.message || "Paystack balance disbursement rejected." },
        { status: 400 }
      );
    }

    // STEP 3: Deduct the funds cleanly from the user's platform balance
    const updatedBalance = wallet.available_balance - amount;
    const { error: updateError } = await adminClient
      .from("platform_wallets")
      .update({ available_balance: updatedBalance })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Critical: Balance mismatch post-payout request:", updateError);
      return NextResponse.json(
        {
          success: true,
          message: "Transfer finalized via payment handler, but wallet balance tracking sync failed.",
          transferCode: transferData.data.transfer_code,
        },
        { status: 202 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Withdrawal transaction dispatched successfully.",
      transferCode: transferData.data.transfer_code,
      reference: transferData.data.reference,
      remainingBalance: updatedBalance,
    });
  } catch (error) {
    console.error("Withdrawal route processing breakdown:", error);
    return NextResponse.json(
      { error: "Internal server crash while executing withdrawal routing protocols." },
      { status: 500 }
    );
  }
}
