/**
 * @jest-environment node
 */

import { adminClient, authenticate } from '../_lib/auth';
import { POST } from './route';

jest.mock('../_lib/auth', () => ({
  adminClient: jest.fn(),
  authenticate: jest.fn(),
}));

const profileQuery = {
  select: jest.fn(),
  eq: jest.fn(),
  maybeSingle: jest.fn(),
  upsert: jest.fn(),
};
const database = {
  from: jest.fn(() => profileQuery),
};
const validPayload = {
  fullName: 'Ama Mensah',
  phoneNumber: '0241234567',
  ghanaCardPin: 'GHA-123456789-0',
  roleTier: 'vendor_micro',
};

function request(body: unknown) {
  return new Request('https://skillbridge.example/api/migration', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-token' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/migration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NATIONAL_ID_HASH_SECRET = 'test-hmac-secret';
    jest.mocked(authenticate).mockResolvedValue({
      user: { id: 'user-123' },
    } as Awaited<ReturnType<typeof authenticate>>);
    jest.mocked(adminClient).mockReturnValue(database as unknown as ReturnType<typeof adminClient>);
    profileQuery.select.mockReturnValue(profileQuery);
    profileQuery.eq.mockReturnValue(profileQuery);
    profileQuery.maybeSingle.mockResolvedValue({
      data: { role_tier: 'vendor_micro' },
      error: null,
    });
    profileQuery.upsert.mockResolvedValue({ error: null });
  });

  it('resets verification to pending whenever identity details are resubmitted', async () => {
    const response = await POST(request(validPayload));

    expect(response.status).toBe(200);
    expect(profileQuery.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'user-123',
        role_tier: 'vendor_micro',
        verification: 'pending',
      }),
      { onConflict: 'id' },
    );
  });

  it('fails closed when the existing profile cannot be checked', async () => {
    profileQuery.maybeSingle.mockResolvedValue({ data: null, error: new Error('database unavailable') });
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    const response = await POST(request(validPayload));

    expect(response.status).toBe(500);
    expect(profileQuery.upsert).not.toHaveBeenCalled();
  });

  it('rejects oversized identity requests before parsing them', async () => {
    const response = await POST(new Request('https://skillbridge.example/api/migration', {
      method: 'POST',
      headers: { Authorization: 'Bearer test-token', 'Content-Length': '16385' },
      body: '{}',
    }));

    expect(response.status).toBe(413);
    expect(profileQuery.upsert).not.toHaveBeenCalled();
  });
});
