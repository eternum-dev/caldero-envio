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

describe('MobileCalculator', () => {
  it('renders with empty cost fields, default 25% margin, and ida y vuelta checked on mount', () => {
    renderWithProviders();

    expect(screen.getByPlaceholderText('ej: 4.5')).toHaveDisplayValue('');
    expect(screen.getByPlaceholderText('ej: 12')).toHaveDisplayValue('');
    expect(screen.getByPlaceholderText('ej: 1200')).toHaveDisplayValue('');
    expect(screen.getByPlaceholderText('ej: 80')).toHaveDisplayValue('');
    expect(screen.getByPlaceholderText('ej: 25')).toHaveDisplayValue('25');

    const checkbox = screen.getByRole('checkbox', { name: /Vuelvo al local/i });
    expect(checkbox).toBeChecked();

    expect(screen.queryByText('Costo estimado')).not.toBeInTheDocument();
    expect(screen.queryByText('Precio sugerido')).not.toBeInTheDocument();
    expect(screen.queryByText('Enviar por WhatsApp')).not.toBeInTheDocument();
  });

  it('shows full breakdown with ida y vuelta after filling 4 cost fields', () => {
    renderWithProviders();

    fireEvent.change(screen.getByPlaceholderText('ej: 4.5'), { target: { value: '4.5' } });
    fireEvent.change(screen.getByPlaceholderText('ej: 12'), { target: { value: '12' } });
    fireEvent.change(screen.getByPlaceholderText('ej: 1200'), { target: { value: '1200' } });
    fireEvent.change(screen.getByPlaceholderText('ej: 80'), { target: { value: '80' } });

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

  it('hides result card when a cost field is cleared', () => {
    renderWithProviders();

    fireEvent.change(screen.getByPlaceholderText('ej: 4.5'), { target: { value: '4.5' } });
    fireEvent.change(screen.getByPlaceholderText('ej: 12'), { target: { value: '12' } });
    fireEvent.change(screen.getByPlaceholderText('ej: 1200'), { target: { value: '1200' } });
    fireEvent.change(screen.getByPlaceholderText('ej: 80'), { target: { value: '80' } });

    expect(screen.getByText('Precio sugerido')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('ej: 4.5'), { target: { value: '' } });

    expect(screen.queryByText('Precio sugerido')).not.toBeInTheDocument();
  });

  it('shows WhatsApp share button only when result is available', () => {
    renderWithProviders();

    expect(screen.queryByText('Enviar por WhatsApp')).not.toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('ej: 4.5'), { target: { value: '4.5' } });
    fireEvent.change(screen.getByPlaceholderText('ej: 12'), { target: { value: '12' } });
    fireEvent.change(screen.getByPlaceholderText('ej: 1200'), { target: { value: '1200' } });
    fireEvent.change(screen.getByPlaceholderText('ej: 80'), { target: { value: '80' } });

    expect(screen.getByText('Enviar por WhatsApp')).toBeInTheDocument();
  });

  it('updates margin label when user changes margin percent', () => {
    renderWithProviders();

    fireEvent.change(screen.getByPlaceholderText('ej: 4.5'), { target: { value: '4.5' } });
    fireEvent.change(screen.getByPlaceholderText('ej: 12'), { target: { value: '12' } });
    fireEvent.change(screen.getByPlaceholderText('ej: 1200'), { target: { value: '1200' } });
    fireEvent.change(screen.getByPlaceholderText('ej: 80'), { target: { value: '80' } });
    fireEvent.change(screen.getByPlaceholderText('ej: 25'), { target: { value: '50' } });

    expect(screen.getByText('Margen (50%)')).toBeInTheDocument();
  });

  it('halves the result when user unchecks ida y vuelta', () => {
    renderWithProviders();

    fireEvent.change(screen.getByPlaceholderText('ej: 4.5'), { target: { value: '4.5' } });
    fireEvent.change(screen.getByPlaceholderText('ej: 12'), { target: { value: '12' } });
    fireEvent.change(screen.getByPlaceholderText('ej: 1200'), { target: { value: '1200' } });
    fireEvent.change(screen.getByPlaceholderText('ej: 80'), { target: { value: '80' } });

    // With ida y vuelta: 9 km
    expect(screen.getByText('$1.620')).toBeInTheDocument();

    // Toggle off
    fireEvent.click(screen.getByRole('checkbox', { name: /Vuelvo al local/i }));

    // Now solo ida: 4.5 km
    expect(screen.getByText('$810')).toBeInTheDocument();
    expect(screen.queryByText('$1.620')).not.toBeInTheDocument();
  });
});
