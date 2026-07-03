import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TransactionItem from '../../../src/ui/atoms/TransactionItem';

describe('TransactionItem', () => {
  it('renders topup transaction with green plus icon', () => {
    const tx = {
      id: 'tx1',
      type: 'topup',
      amount: 150,
      balanceAfter: 160,
      createdAt: Date.now(),
    };
    render(<TransactionItem transaction={tx} packageName="Mini" />);
    expect(screen.getByText('+150 calderos · Mini · hace un momento')).toBeInTheDocument();
    expect(screen.getByText('Saldo: 160')).toBeInTheDocument();
  });

  it('renders free grant transaction with gift emoji', () => {
    const tx = {
      id: 'tx2',
      type: 'free',
      amount: 10,
      balanceAfter: 10,
      createdAt: Date.now(),
    };
    render(<TransactionItem transaction={tx} />);
    expect(screen.getByText('+10 calderos · hace un momento')).toBeInTheDocument();
    expect(screen.getByText('Saldo: 10')).toBeInTheDocument();
  });
});
