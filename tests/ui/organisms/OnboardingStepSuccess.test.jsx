import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OnboardingStepSuccess from '../../../src/ui/organisms/OnboardingStepSuccess';

// Mock Icon since it uses inline SVGs
vi.mock('../../../src/ui/atoms/Icon', () => ({
  default: ({ name }) => <span data-testid={`icon-${name}`}>{name}</span>,
}));

// Mock Button
vi.mock('../../../src/ui/atoms/Button', () => ({
  default: ({ children, onClick }) => (
    <button data-testid="cta-button" onClick={onClick}>{children}</button>
  ),
}));

describe('OnboardingStepSuccess', () => {
  it('renders success message', () => {
    render(<OnboardingStepSuccess onNavigate={vi.fn()} />);
    expect(screen.getByText('¡Todo listo!')).toBeInTheDocument();
    expect(screen.getByText(/Tu local está configurado/)).toBeInTheDocument();
  });

  it('renders the check icon', () => {
    render(<OnboardingStepSuccess onNavigate={vi.fn()} />);
    expect(screen.getByTestId('icon-check')).toBeInTheDocument();
  });

  it('renders "Ir a la app" CTA button', () => {
    render(<OnboardingStepSuccess onNavigate={vi.fn()} />);
    expect(screen.getByText('Ir a la app')).toBeInTheDocument();
  });

  it('calls onNavigate when CTA button is clicked', async () => {
    const onNavigate = vi.fn();
    render(<OnboardingStepSuccess onNavigate={onNavigate} />);
    const ctaButton = screen.getByTestId('cta-button');
    await ctaButton.click();
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });
});