import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CreditBalanceDisplay from '../../../src/ui/molecules/CreditBalanceDisplay';

describe('CreditBalanceDisplay', () => {
  it('renders large balance and label', () => {
    render(<CreditBalanceDisplay balance={260} />);
    expect(screen.getByText('260')).toBeInTheDocument();
    expect(screen.getByText('calderos disponibles')).toBeInTheDocument();
  });

  it('shows skeletons while loading', () => {
    const { container } = render(<CreditBalanceDisplay balance={0} loading />);
    expect(container.querySelectorAll('.animate-shimmer').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText('calderos disponibles')).not.toBeInTheDocument();
  });
});
