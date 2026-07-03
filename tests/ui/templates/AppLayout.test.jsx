import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppLayout from '../../../src/ui/templates/AppLayout';

const { mockUser, mockBalance } = vi.hoisted(() => ({
  mockUser: { uid: 'user-123', email: 'test@test.com' },
  mockBalance: 42,
}));

vi.mock('../../../src/contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
}));

vi.mock('../../../src/hooks/useCredits', () => ({
  useCredits: () => ({ balance: mockBalance, loading: false, error: null }),
}));

describe('AppLayout', () => {
  it('renders CreditBadge for authenticated user', () => {
    render(
      <MemoryRouter>
        <AppLayout>
          <div>App content</div>
        </AppLayout>
      </MemoryRouter>,
    );
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('navigates to settings when CreditBadge is clicked', () => {
    render(
      <MemoryRouter initialEntries={['/app']}>
        <AppLayout>
          <div>App content</div>
        </AppLayout>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByLabelText(/tienes 42 calderos/i));
    expect(screen.getByText('App content')).toBeInTheDocument();
  });
});
