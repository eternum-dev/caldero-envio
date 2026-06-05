import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// ⚠️ Referencias ESTABLES — mismo objeto siempre o useEffect se dispara infinitamente
const stableStore = {
  name: 'Pizzería Don Luigi',
  phone: '+54 11 4321-5678',
  address: 'Av. Corrientes 1234, CABA',
  country: 'AR',
  city: { name: 'Buenos Aires', center: { lat: -34.60, lng: -58.38 }, bbox: [-58.68, -34.90, -58.08, -34.30], population: 15000000 },
  originCoordinates: { lat: -34.60, lng: -58.38 },
  pricingRules: [
    { minKm: 0, maxKm: 3, price: 500 },
    { minKm: 3, maxKm: 10, price: 800 },
  ],
};
const stableCouriers = [
  { id: 'c1', name: 'Carlos', phone: '+54 11 1111 2222' },
  { id: 'c2', name: 'María', phone: '+54 11 3333 4444' },
];
const stableMocks = {
  saveStore: vi.fn(),
  addCourier: vi.fn(),
  removeCourier: vi.fn(),
  updateCourier: vi.fn(),
  saveCouriers: vi.fn(),
  savePricingRules: vi.fn(),
};

vi.mock('../../src/contexts/StoreContext', () => ({
  StoreProvider: ({ children }) => children,
  useStore: () => ({ store: stableStore, couriers: stableCouriers, ...stableMocks }),
}));

vi.mock('../../src/contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({ user: { email: 'dueno@local.com' }, signOut: vi.fn() }),
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

  it('guarda tarifas desde la pestaña pricing', async () => {
    renderSettings();
    fireEvent.click(screen.getByText('Tarifas'));
    fireEvent.click(screen.getByText('Guardar Tarifas'));
    await waitFor(() => {
      expect(stableMocks.savePricingRules).toHaveBeenCalled();
    });
  });

  it('agrega un repartidor', async () => {
    const { container } = render(<MemoryRouter><Settings /></MemoryRouter>);
    fireEvent.click(screen.getByText('Repartidores'));

    const nombre = screen.getByPlaceholderText('Nombre');
    const telefono = screen.getByPlaceholderText('Teléfono');
    fireEvent.change(nombre, { target: { value: 'Pedro' } });
    fireEvent.change(telefono, { target: { value: '+54 11 5555 6666' } });

    // El botón plus es el último button dentro del contenedor
    const btn = container.querySelector('.flex.items-end button');
    fireEvent.click(btn);

    expect(stableMocks.addCourier).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Pedro', phone: '+54 11 5555 6666' })
    );
  });

  it('guarda cambios del local', async () => {
    renderSettings();
    fireEvent.change(
      screen.getByDisplayValue('Pizzería Don Luigi'),
      { target: { value: 'Pizzería Don Luigi 2' } }
    );
    fireEvent.click(screen.getByText('Guardar Cambios'));
    await waitFor(() => {
      expect(stableMocks.saveStore).toHaveBeenCalled();
    });
  });

  it('muestra email y cierra sesión', () => {
    renderSettings();
    expect(screen.getByText(/dueno@local.com/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cerrar Sesión'));
  });
});
