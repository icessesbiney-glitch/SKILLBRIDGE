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

describe('DashboardPage', () => {
  it('shows the public repository operations view', () => {
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

    expect(screen.getByRole('heading', { name: /repository status and deployment readiness/i })).toBeTruthy();
    expect(screen.getByText(/starter digital profile/i)).toBeTruthy();
    expect(screen.getByText(/beginner ghana roadmap/i)).toBeTruthy();
    expect(screen.getByRole('link', { name: /operations/i }).getAttribute('aria-current')).toBe('page');
  });
});
