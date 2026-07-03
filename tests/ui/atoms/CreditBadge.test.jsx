import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CreditBadge from '../../../src/ui/atoms/CreditBadge';

describe('CreditBadge', () => {
  it('renders span by default with emoji on desktop', () => {
    const { container } = render(<CreditBadge balance={10} />);
    expect(container.querySelector('span')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByLabelText(/tienes 10 calderos/i)).toBeInTheDocument();
  });

  it('renders button when onClick is provided', () => {
    render(<CreditBadge balance={10} onClick={vi.fn()} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<CreditBadge balance={10} onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('falls back to 0 for non-numeric balance', () => {
    render(<CreditBadge balance={NaN} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<CreditBadge balance={10} className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
