import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockSaveStore = vi.fn();
const mockAddCourier = vi.fn();
const mockSavePricingRules = vi.fn();
const mockSignOut = vi.fn();

vi.mock('../../src/contexts/StoreContext', () => ({
  StoreProvider: ({ children }) => children,
  useStore: () => ({
    store: {
      name: 'Pizzería Don Luigi',
      phone: '+54 11 4321-5678',
      address: 'Av. Corrientes 1234, CABA',
      country: 'AR',
      city: null,
      originCoordinates: { lat: -34.60, lng: -58.38 },
      pricingRules: [
        { minKm: 0, maxKm: 3, price: 500 },
        { minKm: 3, maxKm: 10, price: 800 },
      ],
    },
    couriers: [
      { id: 'c1', name: 'Carlos', phone: '+54 11 1111 2222' },
      { id: 'c2', name: 'María', phone: '+54 11 3333 4444' },
    ],
    saveStore: mockSaveStore,
    addCourier: mockAddCourier,
    removeCourier: vi.fn(),
    updateCourier: vi.fn(),
    saveCouriers: vi.fn(),
    savePricingRules: mockSavePricingRules,
  }),
}));

vi.mock('../../src/contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({ user: { email: 'dueno@local.com' }, signOut: mockSignOut }),
}));

vi.mock('../../src/services/mapService', () => ({
  getAddressSuggestions: vi.fn(() => Promise.resolve([
    { placeName: 'Av. Corrientes 1234, CABA', coordinates: { lat: -34.60, lng: -58.38 } },
  ])),
  getOffsetByPopulation: vi.fn(() => 0.3),
  createBBox: vi.fn(() => [-58.68, -34.90, -58.08, -34.30]),
  getCitiesByCountry: vi.fn(() => Promise.resolve([
    { name: 'Buenos Aires', center: { lat: -34.60, lng: -58.38 }, population: 15000000 },
  ])),
}));

vi.mock('../../src/ui/molecules/MapPreview', () => ({
  default: () => <div data-testid="map-mock" />,
}));

import Settings from '../../src/pages/Settings';

function renderSettings() {
  return render(<MemoryRouter><Settings /></MemoryRouter>);
}

describe('Settings — flujo de integración', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renderiza datos del local en la pestaña Store', () => {
    renderSettings();
    expect(screen.getByDisplayValue('Pizzería Don Luigi')).toBeInTheDocument();
    expect(screen.getByDisplayValue('+54 11 4321-5678')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Av. Corrientes 1234, CABA')).toBeInTheDocument();
  });

  it('cambia a pestaña Repartidores y muestra la lista', () => {
    renderSettings();
    fireEvent.click(screen.getByText('Repartidores'));
    expect(screen.getByText('Carlos')).toBeInTheDocument();
    expect(screen.getByText('María')).toBeInTheDocument();
  });

  it('cambia a pestaña Tarifas y muestra las reglas', () => {
    renderSettings();
    fireEvent.click(screen.getByText('Tarifas'));
    expect(screen.getByText('Tarifas por Distancia')).toBeInTheDocument();
  });

  it('agrega un repartidor desde la pestaña couriers', async () => {
    renderSettings();

    fireEvent.click(screen.getByText('Repartidores'));

    const nameInput = screen.getByPlaceholderText('Nombre');
    const phoneInput = screen.getByPlaceholderText('Teléfono');

    fireEvent.change(nameInput, { target: { value: 'Pedro' } });
    fireEvent.change(phoneInput, { target: { value: '+54 11 5555 6666' } });

    // Buscar el último botón (el de agregar, con icono plus)
    const buttons = screen.getAllByRole('button');
    const addBtn = buttons[buttons.length - 1];
    fireEvent.click(addBtn);

    expect(mockAddCourier).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Pedro', phone: '+54 11 5555 6666' })
    );
  });

  it('guarda tarifas desde la pestaña pricing', async () => {
    renderSettings();

    fireEvent.click(screen.getByText('Tarifas'));

    fireEvent.click(screen.getByText('Guardar Tarifas'));

    await waitFor(() => {
      expect(mockSavePricingRules).toHaveBeenCalled();
    });
  });

  it('guarda cambios del local desde pestaña store', async () => {
    renderSettings();

    const nameInput = screen.getByDisplayValue('Pizzería Don Luigi');
    fireEvent.change(nameInput, { target: { value: 'Pizzería Don Luigi 2' } });

    fireEvent.click(screen.getByText('Guardar Cambios'));

    await waitFor(() => {
      expect(mockSaveStore).toHaveBeenCalled();
    });
  });

  it('muestra el email del usuario y botón de cerrar sesión', () => {
    renderSettings();
    expect(screen.getByText(/dueno@local.com/)).toBeInTheDocument();
    expect(screen.getByText('Cerrar Sesión')).toBeInTheDocument();
  });

  it('cierra sesión al hacer click en Cerrar Sesión', () => {
    renderSettings();
    fireEvent.click(screen.getByText('Cerrar Sesión'));
    expect(mockSignOut).toHaveBeenCalled();
  });
});
