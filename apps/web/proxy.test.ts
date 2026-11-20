/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { proxy } from './proxy';
import { updateSession } from './utils/supabase/middleware';

jest.mock('./utils/supabase/middleware', () => ({
  updateSession: jest.fn(),
}));

describe('web proxy', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    jest.resetAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('redirects protected routes to auth when Supabase is not configured', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const request = new NextRequest('https://example.com/roadmap');
    const response = await proxy(request);

    expect(response.headers.get('location')).toBe('https://example.com/auth?next=%2Froadmap');
  });

  it('redirects unauthenticated protected requests with the next parameter', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'public-anon-key';
    
    // Aligns perfectly with the new defensive session wrapper layer check
    (updateSession as jest.Mock).mockResolvedValue({
      response: new Response(null, { status: 200 }),
      user: null,
    });

    const request = new NextRequest('https://example.com/dashboard');
    const response = await proxy(request);

    expect(response.headers.get('location')).toBe('https://example.com/auth?next=%2Fdashboard');
  });

  it('preserves the protected route query string in the next parameter', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'public-anon-key';
    
    (updateSession as jest.Mock).mockResolvedValue({
      response: new Response(null, { status: 200 }),
      user: null,
    });

    const request = new NextRequest('https://example.com/roadmap?tab=advanced');
    const response = await proxy(request);

    expect(response.headers.get('location')).toBe(
      'https://example.com/auth?next=%2Froadmap%3Ftab%3Dadvanced',
    );
  });

  it.each([
    '/api/gps',
    '/api/dispatch',
    '/api/delivery/dispatch',
    '/api/rider/telemetry',
    '/api/orders/create',
    '/api/vendor/settle',
  ])('does not expose deferred API route %s', async (path) => {
    const request = new NextRequest(`https://example.com${path}`, { method: 'POST' });
    const response = await proxy(request);

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: 'This endpoint is unavailable.',
      code: 'endpoint_unavailable',
    });
    expect(updateSession).not.toHaveBeenCalled();
  });

  it.each(['/rider/dashboard', '/admin/gps', '/deferred'])(
    'redirects inactive route %s out of current navigation',
    async (path) => {
      const request = new NextRequest(`https://example.com${path}`);
      const response = await proxy(request);

      expect(response.headers.get('location')).toBe('https://example.com/');
      expect(updateSession).not.toHaveBeenCalled();
    },
  );
});
