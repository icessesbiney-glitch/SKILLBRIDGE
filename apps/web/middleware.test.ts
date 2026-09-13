/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

import { middleware } from './middleware';
import { updateSession } from './utils/supabase/middleware';

jest.mock('./utils/supabase/middleware', () => ({
  updateSession: jest.fn(),
}));

describe('web middleware', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    jest.resetAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('allows protected routes through when Supabase is not configured', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    const request = new NextRequest('https://example.com/roadmap');
    const response = await middleware(request);

    expect(response.headers.get('location')).toBeNull();
  });

  it('redirects unauthenticated protected requests with the next parameter', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'public-anon-key';
    (updateSession as jest.Mock).mockResolvedValue({
      response: new Response(null, { status: 200 }),
      user: null,
    });

    const request = new NextRequest('https://example.com/dashboard');
    const response = await middleware(request);

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
    const response = await middleware(request);

    expect(response.headers.get('location')).toBe(
      'https://example.com/auth?next=%2Froadmap%3Ftab%3Dadvanced',
    );
  });
});
