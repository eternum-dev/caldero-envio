import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TransactionList from '../../../src/ui/molecules/TransactionList';

describe('TransactionList', () => {
  it('renders empty message when no transactions', () => {
    render(<TransactionList transactions={[]} />);
    expect(screen.getByText('Aún no tienes movimientos')).toBeInTheDocument();
  });

  it('renders transactions with resolved package names', () => {
    const transactions = [
      { id: 'tx1', type: 'topup', amount: 150, balanceAfter: 160, createdAt: Date.now(), packageId: 'mini' },
      { id: 'tx2', type: 'free', amount: 10, balanceAfter: 10, createdAt: Date.now() },
    ];
    render(<TransactionList transactions={transactions} />);
    expect(screen.getByText('+150 calderos · Mini · hace un momento')).toBeInTheDocument();
    expect(screen.getByText('+10 calderos · hace un momento')).toBeInTheDocument();
  });

  it('shows skeletons while loading', () => {
    const { container } = render(<TransactionList transactions={[]} loading />);
    expect(container.querySelectorAll('.animate-shimmer').length).toBeGreaterThanOrEqual(1);
  });
});
