/**
 * @jest-environment node
 */

import crypto from 'node:crypto';
import { adminClient } from '../_lib/auth';
import { POST } from './route';

jest.mock('../_lib/auth', () => ({
  adminClient: jest.fn(),
}));

const rpc = jest.fn();
const query = {
  select: jest.fn(),
  eq: jest.fn(),
  in: jest.fn(),
  update: jest.fn(),
  maybeSingle: jest.fn(),
};
const database = {
  rpc,
  from: jest.fn(() => query),
};

function request(event: unknown, signature?: string) {
  const body = JSON.stringify(event);
  const webhookSignature = signature ?? crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
    .update(body)
    .digest('hex');
  return new Request('https://skillbridge.example/api/paystack-webhook', {
    method: 'POST',
    headers: { 'x-paystack-signature': webhookSignature },
    body,
  });
}

describe('POST /api/paystack-webhook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.PAYSTACK_SECRET_KEY = 'test-paystack-secret';
    jest.mocked(adminClient).mockReturnValue(database as unknown as ReturnType<typeof adminClient>);
    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    query.in.mockReturnValue(query);
    query.update.mockReturnValue(query);
    query.maybeSingle.mockResolvedValue({
      data: { platform_wallets: { profile_id: 'user-123' } },
      error: null,
    });
    rpc.mockResolvedValue({ data: { success: true }, error: null });
  });

  it('rejects invalid signatures before accessing the database', async () => {
    const response = await POST(request({ event: 'charge.success', data: {} }, 'invalid'));

    expect(response.status).toBe(401);
    expect(adminClient).not.toHaveBeenCalled();
  });

  it('settles signed successful payments through the database function', async () => {
    const response = await POST(request({
      event: 'charge.success',
      data: { reference: 'SB-CHKT-test', amount: 5000, currency: 'GHS' },
    }));

    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith('settle_paystack_payment', {
      payment_reference: 'SB-CHKT-test',
      paid_pesewas: 5000,
      paid_currency: 'GHS',
    });
  });

  it('reverses a matching failed SkillBridge cashout', async () => {
    const reference = 'cashout_12345678-1234-1234-1234-123456789abc';
    const response = await POST(request({
      event: 'transfer.failed',
      data: { reference, amount: 5000, currency: 'GHS' },
    }));

    expect(response.status).toBe(200);
    expect(query.eq).toHaveBeenCalledWith('entry_type', 'withdrawal');
    expect(rpc).toHaveBeenCalledWith('reverse_wallet_withdrawal', {
      target_profile_id: 'user-123',
      returned_amount_cents: 5000,
      failed_reference: reference,
      allow_success_reversal: false,
    });
  });

  it('allows provider reversals to reverse a previously successful transfer', async () => {
    const response = await POST(request({
      event: 'transfer.reversed',
      data: { reference: 'cashout_12345678-1234-1234-1234-123456789abc', amount: 5000, currency: 'GHS' },
    }));

    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith('reverse_wallet_withdrawal', expect.objectContaining({
      allow_success_reversal: true,
    }));
  });

  it('does not acknowledge failed events when the database confirms a successful transfer', async () => {
    rpc.mockResolvedValue({ data: { success: false }, error: null });
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const response = await POST(request({
      event: 'transfer.failed',
      data: { reference: 'cashout_12345678-1234-1234-1234-123456789abc', amount: 5000, currency: 'GHS' },
    }));

    expect(response.status).toBe(500);
    expect(rpc).toHaveBeenCalledWith('reverse_wallet_withdrawal', expect.objectContaining({
      allow_success_reversal: false,
    }));
  });

  it('marks a confirmed SkillBridge cashout as completed', async () => {
    const reference = 'cashout_12345678-1234-1234-1234-123456789abc';
    const response = await POST(request({
      event: 'transfer.success',
      data: { reference, amount: 5000, currency: 'GHS' },
    }));

    expect(response.status).toBe(200);
    expect(database.from).toHaveBeenCalledWith('paystack_transfers');
    expect(query.update).toHaveBeenCalledWith(expect.objectContaining({
      status: 'success',
      completed_at: expect.any(String),
    }));
    expect(query.eq).toHaveBeenCalledWith('amount_cents', 5000);
    expect(query.eq).toHaveBeenCalledWith('currency', 'GHS');
    expect(query.in).toHaveBeenCalledWith('status', ['initialized', 'pending']);
  });

  it('rejects a cashout success event with an unexpected currency', async () => {
    const response = await POST(request({
      event: 'transfer.success',
      data: { reference: 'cashout_12345678-1234-1234-1234-123456789abc', amount: 5000, currency: 'USD' },
    }));

    expect(response.status).toBe(400);
    expect(database.from).not.toHaveBeenCalled();
  });

  it('does not acknowledge a success event whose amount differs from the recorded cashout', async () => {
    query.maybeSingle
      .mockResolvedValueOnce({ data: null, error: null })
      .mockResolvedValueOnce({
        data: { status: 'pending', amount_cents: 6000, currency: 'GHS' },
        error: null,
      });
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    const response = await POST(request({
      event: 'transfer.success',
      data: {
        reference: 'cashout_12345678-1234-1234-1234-123456789abc',
        amount: 5000,
        currency: 'GHS',
      },
    }));

    expect(response.status).toBe(500);
  });

  it('does not acknowledge a failed cashout without its ledger entry', async () => {
    query.maybeSingle.mockResolvedValue({ data: null, error: null });
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    const response = await POST(request({
      event: 'transfer.failed',
      data: {
        reference: 'cashout_12345678-1234-1234-1234-123456789abc',
        amount: 5000,
        currency: 'GHS',
      },
    }));

    expect(response.status).toBe(500);
    expect(rpc).not.toHaveBeenCalled();
  });

  it('does not acknowledge a success event for a reversed cashout', async () => {
    query.maybeSingle
      .mockResolvedValueOnce({ data: null, error: null })
      .mockResolvedValueOnce({ data: { status: 'reversed' }, error: null });
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    const response = await POST(request({
      event: 'transfer.success',
      data: { reference: 'cashout_12345678-1234-1234-1234-123456789abc', amount: 5000, currency: 'GHS' },
    }));

    expect(response.status).toBe(500);
  });

  it('rejects oversized webhook payloads before database access', async () => {
    const response = await POST(new Request('https://skillbridge.example/api/paystack-webhook', {
      method: 'POST',
      body: 'x'.repeat(1_000_001),
    }));

    expect(response.status).toBe(413);
    expect(adminClient).not.toHaveBeenCalled();
  });

  it('ignores transfer events that are not for SkillBridge cashouts', async () => {
    const response = await POST(request({
      event: 'transfer.failed',
      data: { reference: 'external-transfer-123' },
    }));

    expect(response.status).toBe(200);
    expect(database.from).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });
});
