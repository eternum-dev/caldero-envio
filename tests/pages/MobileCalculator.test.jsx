import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import MobileCalculator from '../../src/pages/MobileCalculator';

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
  it('renders with empty fields on mount', () => {
    renderWithProviders();

    expect(screen.getByPlaceholderText('ej: 4.5')).toHaveDisplayValue('');
    expect(screen.getByPlaceholderText('ej: 12')).toHaveDisplayValue('');
    expect(screen.getByPlaceholderText('ej: 1200')).toHaveDisplayValue('');
    expect(screen.getByPlaceholderText('ej: 80')).toHaveDisplayValue('');

    expect(screen.queryByText('Combustible')).not.toBeInTheDocument();
    expect(screen.queryByText('Enviar por WhatsApp')).not.toBeInTheDocument();
  });

  it('shows result card after filling 4 valid fields', () => {
    renderWithProviders();

    fireEvent.change(screen.getByPlaceholderText('ej: 4.5'), { target: { value: '4.5' } });
    fireEvent.change(screen.getByPlaceholderText('ej: 12'), { target: { value: '12' } });
    fireEvent.change(screen.getByPlaceholderText('ej: 1200'), { target: { value: '1200' } });
    fireEvent.change(screen.getByPlaceholderText('ej: 80'), { target: { value: '80' } });

    expect(screen.getByText('Combustible')).toBeInTheDocument();
    expect(screen.getByText('Desgaste')).toBeInTheDocument();
    expect(screen.getByText('Total sugerido')).toBeInTheDocument();
    expect(screen.getByText('$450')).toBeInTheDocument();
    expect(screen.getByText('$360')).toBeInTheDocument();
    expect(screen.getByText('$810')).toBeInTheDocument();
  });

  it('hides result card when a field is cleared', () => {
    renderWithProviders();

    fireEvent.change(screen.getByPlaceholderText('ej: 4.5'), { target: { value: '4.5' } });
    fireEvent.change(screen.getByPlaceholderText('ej: 12'), { target: { value: '12' } });
    fireEvent.change(screen.getByPlaceholderText('ej: 1200'), { target: { value: '1200' } });
    fireEvent.change(screen.getByPlaceholderText('ej: 80'), { target: { value: '80' } });

    expect(screen.getByText('Total sugerido')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('ej: 4.5'), { target: { value: '' } });

    expect(screen.queryByText('Total sugerido')).not.toBeInTheDocument();
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
});
