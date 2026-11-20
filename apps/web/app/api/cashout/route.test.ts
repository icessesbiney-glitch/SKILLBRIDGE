/**
 * @jest-environment node
 */

import { adminClient, authenticate } from '../_lib/auth';
import { POST } from './route';

jest.mock('../_lib/auth', () => ({
  adminClient: jest.fn(),
  authenticate: jest.fn(),
}));

const user = { id: 'user-123' };
const rpc = jest.fn();
const database = { rpc };
const validPayload = {
  amount: '50.00',
  bankCode: 'MTN',
  accountNumber: '0241234567',
  accountName: 'Ama Mensah',
};

function request(body: unknown) {
  return new Request('https://skillbridge.example/api/cashout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/cashout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role';
    process.env.PAYSTACK_SECRET_KEY = 'test-paystack-secret';
    jest.mocked(authenticate).mockResolvedValue({ user } as Awaited<ReturnType<typeof authenticate>>);
    jest.mocked(adminClient).mockReturnValue(database as unknown as ReturnType<typeof adminClient>);
    rpc.mockResolvedValue({ data: { success: true }, error: null });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('rejects invalid payout details before debiting the wallet', async () => {
    const response = await POST(request({ ...validPayload, amount: '49.99' }));

    expect(response.status).toBe(400);
    expect(rpc).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('debits the authenticated user and reports accepted transfers as pending', async () => {
    jest.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({
        status: true,
        data: { recipient_code: 'RCP_test' },
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        status: true,
        data: { transfer_code: 'TRF_test' },
      }), { status: 200 }));

    const response = await POST(request(validPayload));

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      pending: true,
      reference: expect.stringMatching(/^cashout_/),
    });
    expect(rpc).toHaveBeenNthCalledWith(1, 'execute_wallet_withdrawal', expect.objectContaining({
      target_profile_id: user.id,
      requested_amount_cents: 5000,
    }));
    expect(jest.mocked(fetch).mock.calls[1][1]?.headers).toMatchObject({
      Authorization: 'Bearer test-paystack-secret',
    });
  });

  it('does not restore the debit when transfer submission status is ambiguous', async () => {
    jest.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({
        status: true,
        data: { recipient_code: 'RCP_test' },
      }), { status: 200 }))
      .mockRejectedValueOnce(new Error('network timeout'));

    const response = await POST(request(validPayload));

    expect(response.status).toBe(202);
    expect(rpc).toHaveBeenCalledTimes(1);
    await expect(response.json()).resolves.toMatchObject({ pending: true });
  });

  it('restores a debit after an explicit provider rejection', async () => {
    jest.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({
        status: true,
        data: { recipient_code: 'RCP_test' },
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: false }), { status: 400 }));

    const response = await POST(request(validPayload));

    expect(response.status).toBe(502);
    expect(rpc).toHaveBeenNthCalledWith(2, 'reverse_wallet_withdrawal', expect.objectContaining({
      target_profile_id: user.id,
    }));
  });
});
