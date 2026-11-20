/**
 * @jest-environment node
 */

import type { User } from '@supabase/supabase-js';
import { adminClient, authenticate } from '../_lib/auth';
import { POST } from './route';

jest.mock('../_lib/auth', () => ({
  adminClient: jest.fn(),
  authenticate: jest.fn(),
}));

const user: User = {
  id: 'user-123',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2026-01-01T00:00:00.000Z',
  email: 'account@example.com',
};

const insert = jest.fn();
const database = {
  from: jest.fn(() => ({ insert })),
};

function makeRequest(body: unknown) {
  return new Request('https://skillbridge.example/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/checkout', () => {
  const mockedAuthenticate = jest.mocked(authenticate);
  const mockedAdminClient = jest.mocked(adminClient);

  beforeEach(() => {
    process.env.PAYSTACK_SECRET_KEY = 'test-secret';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role';
    delete process.env.NEXT_PUBLIC_URL;
    mockedAuthenticate.mockResolvedValue({ user });
    mockedAdminClient.mockReturnValue(database as unknown as ReturnType<typeof adminClient>);
    insert.mockResolvedValue({ error: null });
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({
        status: true,
        data: {
          id: 987,
          authorization_url: 'https://checkout.paystack.com/example',
        },
      }), { status: 200 }),
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('uses the authenticated email, records the transaction, and returns a safe callback', async () => {
    const response = await POST(makeRequest({
      amount: '45.67',
      email: 'attacker@example.com',
    }));

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      success: true,
      reference: expect.stringMatching(/^SB-CHKT-/),
      checkoutUrl: 'https://checkout.paystack.com/example',
    });

    const [, options] = jest.mocked(fetch).mock.calls[0];
    const requestBody = JSON.parse(String(options?.body));
    expect(requestBody).toMatchObject({
      email: user.email,
      amount: '4567',
      currency: 'GHS',
      callback_url: 'https://skillbridge.example/checkout/success',
      metadata: { user_id: user.id },
    });
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({
      user_id: user.id,
      email: user.email,
      amount: 45.67,
      status: 'initialized',
    }));
  });

  it('rejects invalid amounts before contacting Paystack', async () => {
    const response = await POST(makeRequest({ amount: '0.50' }));

    expect(response.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
    expect(insert).not.toHaveBeenCalled();
  });

  it('does not expose a checkout link when the transaction cannot be recorded', async () => {
    insert.mockResolvedValue({ error: new Error('database unavailable') });

    const response = await POST(makeRequest({ amount: 10 }));

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: 'Unable to safely start the payment. Please try again.',
    });
  });

  it('does not report success when Paystack rejects initialization', async () => {
    jest.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ status: false }), { status: 400 }),
    );

    const response = await POST(makeRequest({ amount: 10 }));

    expect(response.status).toBe(502);
    expect(insert).not.toHaveBeenCalled();
  });
});
