import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { adminClient, authenticate } from '../_lib/auth';
import { readRequestBody, RequestBodyTooLargeError } from '../_lib/request-body';

const PAYSTACK_URL = 'https://api.paystack.co';
const MOBILE_MONEY_NETWORKS = ['MTN', 'VOD', 'ATL'] as const;

function pendingResponse(reference: string) {
  return NextResponse.json(
    {
      success: true,
      pending: true,
      reference,
      message: 'Your cashout is awaiting provider confirmation. Check your wallet activity before retrying.',
    },
    { status: 202 },
  );
}

export async function POST(request: Request) {
  const auth = await authenticate(request);
  if ('error' in auth) return auth.error;

  const admin = adminClient();
  const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
  if (!admin || !paystackSecret) {
    return NextResponse.json({ error: 'Cashout services are not configured.' }, { status: 503 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(new TextDecoder().decode(await readRequestBody(request, 16_384)));
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return NextResponse.json({ error: 'Request body is too large.' }, { status: 413 });
    }
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return NextResponse.json({ error: 'Invalid cashout details.' }, { status: 400 });
  }

  const { amount, bankCode, accountNumber, accountName } = payload as {
    amount?: unknown;
    bankCode?: unknown;
    accountNumber?: unknown;
    accountName?: unknown;
  };
  const amountText =
    typeof amount === 'number' || typeof amount === 'string' ? String(amount) : '';
  if (!/^\d{1,9}(?:\.\d{1,2})?$/.test(amountText)) {
    return NextResponse.json({ error: 'Enter a valid cashout amount in GHS.' }, { status: 400 });
  }
  const amountCents = Math.round(Number(amountText) * 100);
  if (!Number.isSafeInteger(amountCents) || amountCents < 5000) {
    return NextResponse.json({ error: 'Minimum cashout is GHS 50.' }, { status: 400 });
  }

  if (
    typeof bankCode !== 'string' ||
    !MOBILE_MONEY_NETWORKS.includes(bankCode.toUpperCase() as (typeof MOBILE_MONEY_NETWORKS)[number]) ||
    typeof accountNumber !== 'string' ||
    typeof accountName !== 'string'
  ) {
    return NextResponse.json({ error: 'Enter valid mobile money details.' }, { status: 400 });
  }

  const normalizedAccountNumber = accountNumber.replace(/[\s-]/g, '');
  const normalizedAccountName = accountName.trim();
  if (
    !/^(?:\+?233|0)\d{9}$/.test(normalizedAccountNumber) ||
    normalizedAccountName.length < 2 ||
    normalizedAccountName.length > 100
  ) {
    return NextResponse.json({ error: 'Enter a valid Ghanaian mobile money number and account name.' }, { status: 400 });
  }

  const { data: activeCashout, error: activeCashoutError } = await admin
    .from('paystack_transfers')
    .select('reference')
    .eq('user_id', auth.user.id)
    .in('status', ['initialized', 'pending'])
    .limit(1)
    .maybeSingle();
  if (activeCashoutError) {
    console.error('Unable to check for an active cashout.', activeCashoutError);
    return NextResponse.json({ error: 'Cashout status could not be verified.' }, { status: 503 });
  }
  if (activeCashout) {
    return NextResponse.json(
      { error: 'A cashout is already being processed. Check wallet activity before retrying.' },
      { status: 409 },
    );
  }

  const normalizedBankCode = bankCode.toUpperCase();
  const reference = `cashout_${randomUUID()}`;
  const { data: debit, error: debitError } = await admin.rpc('execute_wallet_withdrawal', {
    target_profile_id: auth.user.id,
    requested_amount_cents: amountCents,
    payment_reference: reference,
  });
  if (debitError || !debit?.success) {
    if (debitError) console.error('Wallet rejected a cashout debit.', debitError);
    const message = debit?.error || 'Cashout could not be debited from your wallet.';
    return NextResponse.json(
      { error: message },
      { status: message === 'A cashout is already being processed.' ? 409 : 400 },
    );
  }

  const restoreDebit = async () => {
    const { data, error } = await admin.rpc('reverse_wallet_withdrawal', {
      target_profile_id: auth.user.id,
      returned_amount_cents: amountCents,
      failed_reference: reference,
      allow_success_reversal: false,
    });
    if (error || !data?.success) {
      console.error('Unable to restore a rejected cashout debit.', error ?? data);
      return false;
    }
    return true;
  };

  const headers = {
    Authorization: `Bearer ${paystackSecret}`,
    'Content-Type': 'application/json',
  };

  let recipientResponse: Response;
  try {
    recipientResponse = await fetch(`${PAYSTACK_URL}/transferrecipient`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        type: 'mobile_money',
        name: normalizedAccountName,
        account_number: normalizedAccountNumber,
        bank_code: normalizedBankCode,
        currency: 'GHS',
      }),
      signal: AbortSignal.timeout(15000),
    });
  } catch (error) {
    console.error('Paystack recipient request failed.', error);
    const restored = await restoreDebit();
    return NextResponse.json(
      { error: restored ? 'Unable to verify the payout account. Your wallet debit was restored.' : 'Cashout needs support review.' },
      { status: restored ? 502 : 503 },
    );
  }

  let recipient: { status?: boolean; data?: { recipient_code?: string } } | null = null;
  try {
    recipient = await recipientResponse.json();
  } catch {
    const restored = await restoreDebit();
    return NextResponse.json(
      { error: restored ? 'The payout provider returned an invalid response. Your wallet debit was restored.' : 'Cashout needs support review.' },
      { status: restored ? 502 : 503 },
    );
  }
  const recipientCode = recipient?.data?.recipient_code;
  if (!recipientResponse.ok || !recipient?.status || !recipientCode) {
    const restored = await restoreDebit();
    return NextResponse.json(
      { error: restored ? 'The payout provider rejected these account details. Your wallet debit was restored.' : 'Cashout needs support review.' },
      { status: restored ? 502 : 503 },
    );
  }

  const { data: pendingTransfer, error: pendingTransferError } = await admin
    .from('paystack_transfers')
    .update({ recipient_code: recipientCode, status: 'pending', updated_at: new Date().toISOString() })
    .eq('reference', reference)
    .eq('user_id', auth.user.id)
    .select('reference')
    .maybeSingle();
  if (pendingTransferError || !pendingTransfer) {
    console.error('Unable to record the pending Paystack transfer.', pendingTransferError);
    await restoreDebit();
    return NextResponse.json({ error: 'Cashout needs support review.' }, { status: 503 });
  }

  let transferResponse: Response;
  try {
    transferResponse = await fetch(`${PAYSTACK_URL}/transfer`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        source: 'balance',
        amount: String(amountCents),
        recipient: recipientCode,
        reason: 'SkillBridge cashout',
        currency: 'GHS',
        reference,
      }),
      signal: AbortSignal.timeout(15000),
    });
  } catch (error) {
    console.error('Paystack transfer status is unknown; leaving the debit pending.', error);
    return pendingResponse(reference);
  }

  let transfer: { status?: boolean; data?: { transfer_code?: string } } | null = null;
  try {
    transfer = await transferResponse.json();
  } catch (error) {
    console.error('Paystack transfer returned an unreadable response; leaving the debit pending.', error);
    return pendingResponse(reference);
  }
  if (transferResponse.status >= 500) {
    console.error('Paystack transfer response is ambiguous; leaving the debit pending.', transferResponse.status);
    return pendingResponse(reference);
  }
  if (transfer?.status === false) {
    const restored = await restoreDebit();
    return NextResponse.json(
      { error: restored ? 'The payout provider rejected the transfer. Your wallet debit was restored.' : 'Cashout needs support review.' },
      { status: restored ? 502 : 503 },
    );
  }
  if (!transferResponse.ok || transfer?.status !== true) {
    console.error('Paystack transfer response is ambiguous; leaving the debit pending.', transferResponse.status);
    return pendingResponse(reference);
  }

  if (transfer.data?.transfer_code) {
    const { error: transferCodeError } = await admin
      .from('paystack_transfers')
      .update({ transfer_code: transfer.data.transfer_code, updated_at: new Date().toISOString() })
      .eq('reference', reference)
      .select('reference')
      .maybeSingle();
    if (transferCodeError) {
      console.error('Unable to record the Paystack transfer code.', transferCodeError);
    }
  }

  return NextResponse.json(
    {
      success: true,
      pending: true,
      reference,
      message: 'Your cashout was accepted and is awaiting provider confirmation.',
    },
    { status: 202 },
  );
}
