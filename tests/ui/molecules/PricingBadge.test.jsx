import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PricingBadge from '../../../src/ui/molecules/PricingBadge';

describe('PricingBadge', () => {
  it('renders savings badge with success variant', () => {
    const { container } = render(<PricingBadge text="25% más barato" />);
    expect(screen.getByText('25% más barato')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('bg-green-900/30');
  });

  it('renders popular badge with primary variant and star', () => {
    const { container } = render(<PricingBadge text="Más popular" variant="popular" />);
    expect(screen.getByText('Más popular')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('bg-gold-bg');
    expect(screen.getByText('★')).toBeInTheDocument();
  });
});
