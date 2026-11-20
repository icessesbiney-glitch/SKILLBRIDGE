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
      data: { reference, amount: 5000 },
    }));

    expect(response.status).toBe(200);
    expect(query.eq).toHaveBeenCalledWith('entry_type', 'withdrawal');
    expect(rpc).toHaveBeenCalledWith('reverse_wallet_withdrawal', {
      target_profile_id: 'user-123',
      returned_amount_cents: 5000,
      failed_reference: reference,
    });
  });

  it('does not acknowledge a failed cashout without its ledger entry', async () => {
    query.maybeSingle.mockResolvedValue({ data: null, error: null });
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    const response = await POST(request({
      event: 'transfer.failed',
      data: { reference: 'cashout_12345678-1234-1234-1234-123456789abc', amount: 5000 },
    }));

    expect(response.status).toBe(500);
    expect(rpc).not.toHaveBeenCalled();
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
