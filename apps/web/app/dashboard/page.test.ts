import { render, screen } from '@testing-library/react';

import DashboardPage from './page';

describe('DashboardPage', () => {
  it('shows the public repository operations view', () => {
    render(DashboardPage());

    expect(screen.getByRole('heading', { name: /repository status and deployment readiness/i })).toBeTruthy();
    expect(screen.getByText(/validation runs without suppressing errors/i)).toBeTruthy();
  });
});
