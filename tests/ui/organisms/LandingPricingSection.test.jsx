import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LandingPricingSection from '../../../src/ui/organisms/LandingPricingSection';

describe('LandingPricingSection', () => {
  it('renders headline, subhead and 3 package cards', () => {
    render(<LandingPricingSection isAuthenticated={false} onCTAClick={vi.fn()} />);
    expect(screen.getByText(/calcula envíos sin topar/i)).toBeInTheDocument();
    expect(screen.getByText(/10 calderos gratis al registrarte/i)).toBeInTheDocument();
    expect(screen.getByText('Mini')).toBeInTheDocument();
    expect(screen.getByText('Standard')).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
  });

  it('shows "Crear cuenta gratis" for anonymous users', () => {
    render(<LandingPricingSection isAuthenticated={false} onCTAClick={vi.fn()} />);
    expect(screen.getByRole('button', { name: /crear cuenta gratis/i })).toBeInTheDocument();
  });

  it('shows "Ir a la app" for authenticated users', () => {
    render(<LandingPricingSection isAuthenticated onCTAClick={vi.fn()} />);
    expect(screen.getByRole('button', { name: /ir a la app/i })).toBeInTheDocument();
  });

  it('calls onCTAClick when CTA is clicked', () => {
    const handleClick = vi.fn();
    render(<LandingPricingSection isAuthenticated={false} onCTAClick={handleClick} />);
    fireEvent.click(screen.getByRole('button', { name: /crear cuenta gratis/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
