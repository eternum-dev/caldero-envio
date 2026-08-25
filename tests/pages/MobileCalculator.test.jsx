import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import MobileCalculator from '../../src/pages/MobileCalculator';

vi.mock('../../src/contexts/AuthContext', () => ({
  useAuth: () => ({ user: null }),
}));

function renderWithProviders() {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <MobileCalculator />
      </MemoryRouter>
    </HelmetProvider>
  );
}

function fillCostFields({ distance = '4.5', kmPerLiter = '12', pricePerLiter = '1200', wearCostPerKm = '80' } = {}) {
  fireEvent.change(screen.getByPlaceholderText('ej: 4.5'), { target: { value: distance } });
  fireEvent.change(screen.getByPlaceholderText('ej: 12'), { target: { value: kmPerLiter } });
  fireEvent.change(screen.getByPlaceholderText('ej: 1200'), { target: { value: pricePerLiter } });
  fireEvent.change(screen.getByPlaceholderText('ej: 80'), { target: { value: wearCostPerKm } });
}

describe('MobileCalculator', () => {
  it('renders with empty cost fields, default 25% margin, and ida y vuelta checked on mount', () => {
    renderWithProviders();

    expect(screen.getByPlaceholderText('ej: 4.5')).toHaveDisplayValue('');
    expect(screen.getByPlaceholderText('ej: 12')).toHaveDisplayValue('');
    expect(screen.getByPlaceholderText('ej: 1200')).toHaveDisplayValue('');
    expect(screen.getByPlaceholderText('ej: 80')).toHaveDisplayValue('');
    expect(screen.getByPlaceholderText('ej: 25')).toHaveDisplayValue('25');

    expect(screen.getByRole('checkbox', { name: /Vuelvo al local/i })).toBeChecked();

    expect(screen.queryByText('Costo estimado')).not.toBeInTheDocument();
    expect(screen.queryByText('Precio sugerido')).not.toBeInTheDocument();
  });

  it('does not show result until Calcular is clicked (button-based flow)', () => {
    renderWithProviders();

    fillCostFields();

    // Result is NOT visible yet — we removed live updates
    expect(screen.queryByText('Costo estimado')).not.toBeInTheDocument();
    expect(screen.queryByText('Precio sugerido')).not.toBeInTheDocument();
  });

  it('shows full breakdown with ida y vuelta after clicking Calcular', () => {
    renderWithProviders();

    fillCostFields();
    fireEvent.click(screen.getByRole('button', { name: /^Calcular$/ }));

    expect(screen.getByText('Combustible')).toBeInTheDocument();
    expect(screen.getByText('Desgaste')).toBeInTheDocument();
    expect(screen.getByText('Costo estimado')).toBeInTheDocument();
    expect(screen.getByText('Margen (25%)')).toBeInTheDocument();
    expect(screen.getByText('Precio sugerido')).toBeInTheDocument();

    // 4.5 km * 2 (ida y vuelta) = 9 km
    expect(screen.getByText('$900')).toBeInTheDocument();
    expect(screen.getByText('$720')).toBeInTheDocument();
    expect(screen.getByText('$1.620')).toBeInTheDocument();
  });

  it('disables Calcular button when form is invalid', () => {
    renderWithProviders();

    const calcularButton = screen.getByRole('button', { name: /^Calcular$/ });
    expect(calcularButton).toBeDisabled();

    fillCostFields();
    expect(calcularButton).not.toBeDisabled();
  });

  it('clears result when user changes an input after calculating', () => {
    renderWithProviders();

    fillCostFields();
    fireEvent.click(screen.getByRole('button', { name: /^Calcular$/ }));
    expect(screen.getByText('Precio sugerido')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('ej: 4.5'), { target: { value: '5' } });
    expect(screen.queryByText('Precio sugerido')).not.toBeInTheDocument();
  });

  it('clears result when user toggles ida y vuelta after calculating', () => {
    renderWithProviders();

    fillCostFields();
    fireEvent.click(screen.getByRole('button', { name: /^Calcular$/ }));
    expect(screen.getByText('$1.620')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('checkbox', { name: /Vuelvo al local/i }));
    expect(screen.queryByText('$1.620')).not.toBeInTheDocument();
  });

  it('updates margin label when user changes margin percent and re-calculates', () => {
    renderWithProviders();

    fillCostFields();
    fireEvent.click(screen.getByRole('button', { name: /^Calcular$/ }));
    expect(screen.getByText('Margen (25%)')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('ej: 25'), { target: { value: '50' } });
    fireEvent.click(screen.getByRole('button', { name: /^Calcular$/ }));
    expect(screen.getByText('Margen (50%)')).toBeInTheDocument();
  });

  it('halves the result when user unchecks ida y vuelta and re-calculates', () => {
    renderWithProviders();

    fillCostFields();
    fireEvent.click(screen.getByRole('button', { name: /^Calcular$/ }));
    expect(screen.getByText('$1.620')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('checkbox', { name: /Vuelvo al local/i }));
    fireEvent.click(screen.getByRole('button', { name: /^Calcular$/ }));

    // Now solo ida: 4.5 km
    expect(screen.getByText('$810')).toBeInTheDocument();
    expect(screen.queryByText('$1.620')).not.toBeInTheDocument();
  });

  it('"Probar con valores de ejemplo" fills the form but does NOT auto-calculate', () => {
    renderWithProviders();

    expect(screen.queryByText('Costo estimado')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Probar con valores de ejemplo/i }));

    // Form is filled
    expect(screen.getByPlaceholderText('ej: 4.5')).toHaveDisplayValue('4.5');
    expect(screen.getByPlaceholderText('ej: 12')).toHaveDisplayValue('12');
    expect(screen.getByPlaceholderText('ej: 1200')).toHaveDisplayValue('1200');
    expect(screen.getByPlaceholderText('ej: 80')).toHaveDisplayValue('80');

    // But no result yet — user must click Calcular
    expect(screen.queryByText('Costo estimado')).not.toBeInTheDocument();
    expect(screen.queryByText('$2.025')).not.toBeInTheDocument();
  });

  it('wear cost presets fill the wear cost field with sensible defaults', () => {
    renderWithProviders();

    fireEvent.click(screen.getByRole('button', { name: /Moto/ }));
    expect(screen.getByPlaceholderText('ej: 80')).toHaveDisplayValue('30');

    fireEvent.click(screen.getByRole('button', { name: /Camioneta/ }));
    expect(screen.getByPlaceholderText('ej: 80')).toHaveDisplayValue('120');

    fireEvent.click(screen.getByRole('button', { name: /Auto/ }));
    expect(screen.getByPlaceholderText('ej: 80')).toHaveDisplayValue('80');
  });

  it('"Limpiar" resets the form to defaults and clears result', () => {
    renderWithProviders();

    fillCostFields();
    fireEvent.click(screen.getByRole('button', { name: /^Calcular$/ }));
    expect(screen.getByText('Precio sugerido')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^Limpiar$/ }));

    // All cost fields back to empty (margin stays at 25, ida y vuelta stays checked — those are defaults)
    expect(screen.getByPlaceholderText('ej: 4.5')).toHaveDisplayValue('');
    expect(screen.getByPlaceholderText('ej: 12')).toHaveDisplayValue('');
    expect(screen.getByPlaceholderText('ej: 1200')).toHaveDisplayValue('');
    expect(screen.getByPlaceholderText('ej: 80')).toHaveDisplayValue('');
    expect(screen.getByPlaceholderText('ej: 25')).toHaveDisplayValue('25');
    expect(screen.getByRole('checkbox', { name: /Vuelvo al local/i })).toBeChecked();

    // Result cleared
    expect(screen.queryByText('Precio sugerido')).not.toBeInTheDocument();
  });

  it('shows WhatsApp share button only after Calcular', () => {
    renderWithProviders();

    expect(screen.queryByText('Enviar por WhatsApp')).not.toBeInTheDocument();

    fillCostFields();
    expect(screen.queryByText('Enviar por WhatsApp')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^Calcular$/ }));
    expect(screen.getByText('Enviar por WhatsApp')).toBeInTheDocument();
  });

  it('shows Caldero Envío CTA only after Calcular (soft conversion)', () => {
    renderWithProviders();

    // Not visible before calculation
    expect(screen.queryByText(/Cansado de cargar datos a mano/)).not.toBeInTheDocument();

    fillCostFields();
    expect(screen.queryByText(/Cansado de cargar datos a mano/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^Calcular$/ }));

    // Visible after calculation
    expect(screen.getByText(/Cansado de cargar datos a mano/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Probar Caldero Envío/i })).toHaveAttribute(
      'href',
      '/register'
    );
  });
});
