import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import OnboardingStepPricing from '../../../src/ui/organisms/OnboardingStepPricing';

const defaultProps = {
  pricingRules: [
    { minKm: 0, maxKm: 3, price: 500 },
    { minKm: 3, maxKm: 5, price: 700 },
    { minKm: 5, maxKm: 10, price: 1000 },
  ],
  pricingErrors: [null, null, null],
  onPricingChange: vi.fn(),
  onAddRule: vi.fn(),
  onRemoveRule: vi.fn(),
};

describe('OnboardingStepPricing', () => {
  it('renders pricing rule rows with all fields', () => {
    render(<OnboardingStepPricing {...defaultProps} />);
    const labels = screen.getAllByText(/Desde \(km\)/i);
    expect(labels).toHaveLength(3);
  });

  it('renders all number input fields', () => {
    render(<OnboardingStepPricing {...defaultProps} />);
    const numberInputs = screen.getAllByRole('spinbutton');
    // 3 rules × 3 fields = 9 inputs
    expect(numberInputs).toHaveLength(9);
  });

  it('renders add rule button', () => {
    render(<OnboardingStepPricing {...defaultProps} />);
    expect(screen.getByText('Agregar regla')).toBeInTheDocument();
  });

  it('calls onAddRule when add rule button is clicked', async () => {
    const onAddRule = vi.fn();
    render(<OnboardingStepPricing {...defaultProps} onAddRule={onAddRule} />);
    await screen.getByText('Agregar regla').click();
    expect(onAddRule).toHaveBeenCalled();
  });

  it('calls onRemoveRule when remove button is clicked', async () => {
    const onRemoveRule = vi.fn();
    render(<OnboardingStepPricing {...defaultProps} onRemoveRule={onRemoveRule} />);
    const removeButtons = screen.getAllByRole('button').filter(
      b => b.textContent === '' && b.querySelector('svg')
    );
    expect(removeButtons.length).toBeGreaterThan(0);
    await removeButtons[0].click();
    expect(onRemoveRule).toHaveBeenCalledWith(0);
  });

  it('displays error message for invalid rule', () => {
    const pricingErrors = [null, 'El precio no puede ser menor al de la regla anterior', null];
    render(<OnboardingStepPricing {...defaultProps} pricingErrors={pricingErrors} />);
    expect(screen.getByText('El precio no puede ser menor al de la regla anterior')).toBeInTheDocument();
  });

  it('highlights row with error using error styling', () => {
    const pricingErrors = ['El precio debe ser mayor a 0', null, null];
    render(<OnboardingStepPricing {...defaultProps} pricingErrors={pricingErrors} />);
    // The error <p> is a sibling of the row <div>, both inside an outer <div>
    const errorText = screen.getByText('El precio debe ser mayor a 0');
    const rowDiv = errorText.previousElementSibling;
    expect(rowDiv?.className).toContain('bg-error-container');
  });

  it('renders only one rule row when single rule provided', () => {
    const singleRule = [{ minKm: 0, maxKm: 3, price: 500 }];
    render(<OnboardingStepPricing {...defaultProps} pricingRules={singleRule} pricingErrors={[null]} />);
    const labels = screen.getAllByText(/Desde \(km\)/i);
    expect(labels).toHaveLength(1);
  });
});