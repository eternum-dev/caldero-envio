import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import CitySelect from '../../../src/ui/molecules/CitySelect';

const mockCities = [
  { name: 'Santiago', center: { lat: -33.45, lng: -70.66 }, population: 6000000 },
  { name: 'Valparaíso', center: { lat: -33.04, lng: -71.62 }, population: 300000 },
  { name: 'Concepción', center: { lat: -36.82, lng: -73.05 }, population: 200000 },
];

vi.mock('../../../src/services/mapService', () => ({
  getCitiesByCountry: vi.fn(() => Promise.resolve(mockCities)),
}));

describe('CitySelect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows disabled state when no country selected', () => {
    render(<CitySelect value={null} onChange={vi.fn()} country="" />);
    expect(screen.getByText('Selecciona un país primero')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows placeholder when country is selected', async () => {
    render(<CitySelect value={null} onChange={vi.fn()} country="CL" />);

    // Wait for async city fetch to complete
    await waitFor(() => {
      expect(screen.queryByText('Cargando ciudades...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Seleccionar ciudad')).toBeInTheDocument();
  });

  it('opens dropdown on click', async () => {
    render(<CitySelect value={null} onChange={vi.fn()} country="CL" />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Buscar ciudad...')).toBeInTheDocument();
    });
  });

  it('shows city options after opening', async () => {
    render(<CitySelect value={null} onChange={vi.fn()} country="CL" />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    await waitFor(() => {
      expect(screen.getByText('Santiago')).toBeInTheDocument();
      expect(screen.getByText('Valparaíso')).toBeInTheDocument();
    });
  });

  it('filters cities when typing in search', async () => {
    render(<CitySelect value={null} onChange={vi.fn()} country="CL" />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Buscar ciudad...')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Buscar ciudad...'), { target: { value: 'Val' } });

    expect(screen.getByText('Valparaíso')).toBeInTheDocument();
    expect(screen.queryByText('Santiago')).not.toBeInTheDocument();
    expect(screen.queryByText('Concepción')).not.toBeInTheDocument();
  });

  it('calls onChange with city data on selection', async () => {
    const onChange = vi.fn();
    render(<CitySelect value={null} onChange={onChange} country="CL" />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    await waitFor(() => {
      expect(screen.getByText('Santiago')).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Santiago'));
    });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Santiago',
        center: { lat: -33.45, lng: -70.66 },
        population: 6000000,
      })
    );
  });

  it('shows selected city name', async () => {
    render(<CitySelect value={{ name: 'Santiago' }} onChange={vi.fn()} country="CL" />);

    // Wait for async city fetch so the component can match value.name against cities
    await waitFor(() => {
      expect(screen.queryByText('Cargando ciudades...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Santiago')).toBeInTheDocument();
  });

  it('closes dropdown on click outside', async () => {
    render(
      <div>
        <span data-testid="outside">Outside</span>
        <CitySelect value={null} onChange={vi.fn()} country="CL" />
      </div>
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Buscar ciudad...')).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.mouseDown(screen.getByTestId('outside'));
    });

    expect(screen.queryByPlaceholderText('Buscar ciudad...')).not.toBeInTheDocument();
  });
});
