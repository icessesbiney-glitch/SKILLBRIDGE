import { render, screen } from '@testing-library/react';

import DashboardPage from './page';
import { useAuthSession } from '../../hooks/useAuthSession';

jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
}));

jest.mock('../../hooks/useAuthSession', () => ({
  useAuthSession: jest.fn(),
}));

jest.mock('../../utils/supabaseClient', () => ({
  supabase: null,
}));

describe('DashboardPage', () => {
  it('shows the authenticated marketplace dashboard', () => {
    (useAuthSession as jest.Mock).mockReturnValue({
      isConfigured: true,
      isLoading: false,
      session: {
        user: {
          email: 'learner@example.com',
        },
      },
    });

    render(<DashboardPage />);

    // Aligned to match your clean repository operational headers perfectly
    expect(screen.getByRole('heading', { name: /marketplace dashboard/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /browse marketplace/i }).getAttribute('href')).toBe('/tasks');
  });
});
