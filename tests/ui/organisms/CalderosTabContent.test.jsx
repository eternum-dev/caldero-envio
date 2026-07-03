import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CalderosTabContent from '../../../src/ui/organisms/CalderosTabContent';

const { mockBalance, mockTransactions, mockBalanceLoading, mockTransactionsLoading } = vi.hoisted(() => ({
  mockBalance: 260,
  mockTransactions: [{ id: 'tx1', type: 'free', amount: 10, balanceAfter: 10, createdAt: Date.now() }],
  mockBalanceLoading: false,
  mockTransactionsLoading: false,
}));

vi.mock('../../../src/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { uid: 'user-123' } }),
}));

vi.mock('../../../src/hooks/useCredits', () => ({
  useCredits: () => ({ balance: mockBalance, loading: mockBalanceLoading, error: null }),
}));

vi.mock('../../../src/hooks/useTransactions', () => ({
  useTransactions: () => ({ transactions: mockTransactions, loading: mockTransactionsLoading, error: null }),
}));

describe('CalderosTabContent', () => {
  it('renders balance, grid, history and legal text', () => {
    render(<CalderosTabContent />);
    expect(screen.getByText('260')).toBeInTheDocument();
    expect(screen.getByText('calderos disponibles')).toBeInTheDocument();
    expect(screen.getByText('Mini')).toBeInTheDocument();
    expect(screen.getByText('Standard')).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByText('+10 calderos · hace un momento')).toBeInTheDocument();
    expect(screen.getByText(/por el momento no emitimos boleta/i)).toBeInTheDocument();
  });

  it('shows all package buttons as disabled with "Próximamente"', () => {
    render(<CalderosTabContent />);
    const buttons = screen.getAllByRole('button', { name: /próximamente/i });
    expect(buttons).toHaveLength(3);
    buttons.forEach(btn => expect(btn).toBeDisabled());
  });
});
