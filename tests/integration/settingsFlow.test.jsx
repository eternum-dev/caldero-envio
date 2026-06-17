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
    expect(screen.getByText('Teléfono')).toBeInTheDocument();
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
    const telefono = screen.getByPlaceholderText('9 1234 5678');
    fireEvent.change(nombre, { target: { value: 'Pedro' } });
    fireEvent.change(telefono, { target: { value: '91155556666' } });

    // El botón plus es el último button dentro del contenedor
    const btn = container.querySelector('.flex.items-end button');
    fireEvent.click(btn);

    expect(stableMocks.addCourier).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Pedro', phone: '+5491155556666' })
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

  it('cascada: cambiar "Hasta" actualiza el "Desde" de la siguiente regla', () => {
    renderSettings();
    fireEvent.click(screen.getByText('Tarifas'));
    const inputs = screen.getAllByRole('spinbutton');
    // pricingRules have 2 rows: [0:{min:0, max:3}, 1:{min:3, max:10}]
    // spinbuttons: [0]=min0, [1]=max0, [2]=price0, [3]=min1, [4]=max1, [5]=price1
    // Change maxKm of first row from 3 to 5
    fireEvent.change(inputs[1], { target: { value: '5' } });
    // The second row's minKm should now be 5 (auto-cascaded from first row's maxKm)
    expect(inputs[3]).toHaveValue(5);
  });

  it('nueva regla hereda el "Hasta" de la última regla como su "Desde"', () => {
    renderSettings();
    fireEvent.click(screen.getByText('Tarifas'));
    fireEvent.click(screen.getByText('Agregar regla'));
    const inputs = screen.getAllByRole('spinbutton');
    // After adding: [0]=min0(0), [1]=max0(3), [2]=price0(500), [3]=min1(3), [4]=max1(10), [5]=price1(800), [6]=min2(10), [7]=max2(null), [8]=price2(0)
    expect(inputs[6]).toHaveValue(10);
  });

  it('"Desde (km)" inputs están deshabilitados', () => {
    renderSettings();
    fireEvent.click(screen.getByText('Tarifas'));
    const inputs = screen.getAllByRole('spinbutton');
    // minKm fields are at indices 0 and 3
    expect(inputs[0]).toBeDisabled();
    expect(inputs[3]).toBeDisabled();
  });

  it('actualiza precio desde la pestaña pricing y guarda', async () => {
    renderSettings();
    fireEvent.click(screen.getByText('Tarifas'));
    const inputs = screen.getAllByRole('spinbutton');
    // Change price of first rule from 500 to 600
    fireEvent.change(inputs[2], { target: { value: '600' } });
    fireEvent.click(screen.getByText('Guardar Tarifas'));
    await waitFor(() => {
      expect(stableMocks.savePricingRules).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ minKm: 0, maxKm: 3, price: 600 }),
        ])
      );
    });
  });

  });
