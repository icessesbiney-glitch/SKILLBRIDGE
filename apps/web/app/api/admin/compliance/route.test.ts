/**
 * @jest-environment node
 */

import { adminClient, authenticate, isAdmin } from '../../_lib/auth';
import { GET, POST } from './route';

jest.mock('../../_lib/auth', () => ({
  adminClient: jest.fn(),
  authenticate: jest.fn(),
  isAdmin: jest.fn(),
}));

const user = { id: 'admin-123' };
const profile = {
  id: 'profile-123',
  legal_name: 'Ama Mensah',
  phone_number: '0241234567',
  role_tier: 'vendor_micro',
  verification: 'verified',
  created_at: '2026-01-01T00:00:00.000Z',
};
const query = {
  select: jest.fn(),
  order: jest.fn(),
  limit: jest.fn(),
  update: jest.fn(),
  eq: jest.fn(),
  maybeSingle: jest.fn(),
};
const database = { from: jest.fn(() => query) };

function request(body?: unknown) {
  return new Request('https://skillbridge.example/api/admin/compliance', {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      Authorization: 'Bearer test-session',
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe('/api/admin/compliance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(authenticate).mockResolvedValue({ user } as Awaited<ReturnType<typeof authenticate>>);
    jest.mocked(isAdmin).mockResolvedValue(true);
    jest.mocked(adminClient).mockReturnValue(database as unknown as ReturnType<typeof adminClient>);
    query.select.mockReturnValue(query);
    query.order.mockReturnValue(query);
    query.limit.mockResolvedValue({ data: [profile], error: null });
    query.update.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    query.maybeSingle.mockResolvedValue({ data: profile, error: null });
  });

  it('rejects non-administrators without reading profile records', async () => {
    jest.mocked(isAdmin).mockResolvedValue(false);

    const response = await GET(request());

    expect(response.status).toBe(403);
    expect(database.from).not.toHaveBeenCalled();
  });

  it('returns only review fields and omits the national ID hash', async () => {
    const response = await GET(request());

    expect(response.status).toBe(200);
    expect(query.select).toHaveBeenCalledWith(
      'id, legal_name, phone_number, role_tier, verification, created_at',
    );
    await expect(response.json()).resolves.toEqual({ profiles: [profile] });
  });

  it('only allows a valid pending profile to be updated', async () => {
    const response = await POST(request({
      profileId: '01234567-89ab-cdef-0123-456789abcdef',
      verification: 'verified',
    }));

    expect(response.status).toBe(200);
    expect(query.update).toHaveBeenCalledWith({ verification: 'verified' });
    expect(query.eq).toHaveBeenCalledWith('verification', 'pending');
    await expect(response.json()).resolves.toEqual({ profile });
  });

  it('rejects invalid roles and profile identifiers before writing', async () => {
    const response = await POST(request({
      profileId: 'not-a-uuid',
      verification: 'admin_central',
    }));

    expect(response.status).toBe(400);
    expect(query.update).not.toHaveBeenCalled();
  });
});
