/**
 * @jest-environment node
 */

import { adminClient, authenticate } from '../../_lib/auth';
import { GET } from './route';

jest.mock('../../_lib/auth', () => ({
  adminClient: jest.fn(),
  authenticate: jest.fn(),
}));

const wallet = {
  id: 'wallet-123',
  profile_id: 'user-123',
  balance_cents: 15000,
  currency: 'GHS',
  updated_at: '2026-11-20T00:00:00.000Z',
};
const withdrawals = [
  { id: '1', amount_cents: -5000, reference_id: 'cashout_complete', created_at: '2026-11-20T00:00:00.000Z' },
  { id: '2', amount_cents: -6000, reference_id: 'cashout_reversed', created_at: '2026-11-19T00:00:00.000Z' },
  { id: '3', amount_cents: -4000, reference_id: 'cashout_pending', created_at: '2026-11-18T00:00:00.000Z' },
];

function makeQuery() {
  const query = {
    select: jest.fn(),
    eq: jest.fn(),
    lt: jest.fn(),
    order: jest.fn(),
    limit: jest.fn(),
    in: jest.fn(),
    maybeSingle: jest.fn(),
  };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.lt.mockReturnValue(query);
  query.order.mockReturnValue(query);
  query.limit.mockReturnValue(query);
  query.in.mockReturnValue(query);
  return query;
}

describe('GET /api/wallet/balance', () => {
  const walletQuery = makeQuery();
  const withdrawalQuery = makeQuery();
  const reversalQuery = makeQuery();
  const transferQuery = makeQuery();
  const database = {
    from: jest.fn()
      .mockReturnValueOnce(walletQuery)
      .mockReturnValueOnce(withdrawalQuery)
      .mockReturnValueOnce(reversalQuery)
      .mockReturnValueOnce(transferQuery),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(authenticate).mockResolvedValue({
      user: { id: 'user-123' },
    } as Awaited<ReturnType<typeof authenticate>>);
    jest.mocked(adminClient).mockReturnValue(database as unknown as ReturnType<typeof adminClient>);
    walletQuery.maybeSingle.mockResolvedValue({ data: wallet, error: null });
    withdrawalQuery.limit.mockResolvedValue({ data: withdrawals, error: null });
    reversalQuery.in.mockResolvedValue({
      data: [{ reference_id: 'reversal_cashout_reversed' }],
      error: null,
    });
    transferQuery.in.mockResolvedValue({
      data: [{ reference: 'cashout_complete', status: 'success' }],
      error: null,
    });
  });

  it('reports completed, reversed, and pending cashout statuses from server records', async () => {
    const response = await GET(new Request('https://skillbridge.example/api/wallet/balance'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      wallet: { balanceGhs: '150.00' },
      recentWithdrawals: [
        { reference: 'cashout_complete', status: 'completed' },
        { reference: 'cashout_reversed', status: 'reversed' },
        { reference: 'cashout_pending', status: 'pending' },
      ],
    });
    expect(transferQuery.eq).toHaveBeenCalledWith('user_id', 'user-123');
  });
});
