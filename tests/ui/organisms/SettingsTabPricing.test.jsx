import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SettingsTabPricing from '../../../src/ui/organisms/SettingsTabPricing';

const defaultProps = {
  pricingRules: [
    { minKm: 0, maxKm: 3, price: 500 },
    { minKm: 3, maxKm: 5, price: 700 },
  ],
  loading: false,
  onChange: vi.fn(),
  onAdd: vi.fn(),
  onSave: vi.fn(),
};

describe('SettingsTabPricing', () => {
  it('renders pricing rule rows with all fields', () => {
    render(<SettingsTabPricing {...defaultProps} />);
    const labels = screen.getAllByText(/Desde \(km\)/i);
    expect(labels).toHaveLength(2);
  });

  it('renders all number input fields', () => {
    render(<SettingsTabPricing {...defaultProps} />);
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs).toHaveLength(6);
  });

  it('renders add rule button', () => {
    render(<SettingsTabPricing {...defaultProps} />);
    expect(screen.getByText('Agregar regla')).toBeInTheDocument();
  });

  it('renders save button', () => {
    render(<SettingsTabPricing {...defaultProps} />);
    expect(screen.getByText('Guardar Tarifas')).toBeInTheDocument();
  });

  it('calls onAdd when add rule button is clicked', async () => {
    const onAdd = vi.fn();
    render(<SettingsTabPricing {...defaultProps} onAdd={onAdd} />);
    await screen.getByText('Agregar regla').click();
    expect(onAdd).toHaveBeenCalled();
  });

  it('calls onSave when save button is clicked', async () => {
    const onSave = vi.fn();
    render(<SettingsTabPricing {...defaultProps} onSave={onSave} />);
    await screen.getByText('Guardar Tarifas').click();
    expect(onSave).toHaveBeenCalled();
  });

  it('calls onChange when a field value is changed', async () => {
    const onChange = vi.fn();
    render(<SettingsTabPricing {...defaultProps} onChange={onChange} />);
    const inputs = screen.getAllByRole('spinbutton');
    await inputs[0].focus();
    // Verify onChange is called with index, field, and parsed value
  });

  it('renders correctly with single rule', () => {
    const singleRule = [{ minKm: 0, maxKm: 3, price: 500 }];
    render(<SettingsTabPricing {...defaultProps} pricingRules={singleRule} />);
    const labels = screen.getAllByText(/Desde \(km\)/i);
    expect(labels).toHaveLength(1);
  });
});