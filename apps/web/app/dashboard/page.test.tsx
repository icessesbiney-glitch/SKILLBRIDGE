import { render, screen } from '@testing-library/react';

import DashboardPage from './page';

jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

describe('DashboardPage', () => {
  it('shows the public repository operations view', () => {
    render(<DashboardPage />);

    expect(screen.getByRole('heading', { name: /repository status and deployment readiness/i })).toBeTruthy();
    expect(screen.getByText(/validation runs without suppressing errors/i)).toBeTruthy();
    expect(screen.getByRole('link', { name: /operations/i }).getAttribute('aria-current')).toBe('page');
  });
});
