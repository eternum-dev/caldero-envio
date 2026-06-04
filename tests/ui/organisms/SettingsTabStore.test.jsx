import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsTabStore from '../../../src/ui/organisms/SettingsTabStore';

vi.mock('../../../src/ui/molecules/MapPreview', () => ({
  default: () => <div data-testid="map-preview">Map</div>,
}));

vi.mock('../../../src/ui/molecules/SearchBox', () => ({
  default: ({ onSuggest, onSearch, suggestions, loading, placeholder }) => (
    <div data-testid="search-box">
      <span>{placeholder}</span>
      <button data-testid="suggest-btn" onClick={() => onSuggest?.('test')}>Suggest</button>
      <button data-testid="search-btn" onClick={() => onSearch?.('addr', { lat: 1, lng: 2 })}>Search</button>
      {loading && <span data-testid="search-loading">Loading</span>}
      <span data-testid="suggestions-count">{suggestions?.length || 0}</span>
    </div>
  ),
}));

vi.mock('../../../src/ui/molecules/CitySelect', () => ({
  default: ({ onChange, country }) => (
    <div data-testid="city-select">
      <span data-testid="city-country">{country}</span>
      <button data-testid="city-btn" onClick={() => onChange({ name: 'Santiago', center: { lng: -70.6, lat: -33.4 }, bbox: [-71, -34, -70, -33], population: 5000000 })}>Select City</button>
    </div>
  ),
}));

vi.mock('../../../src/ui/molecules/CountrySelect', () => ({
  default: ({ onChange, value }) => (
    <div data-testid="country-select">
      <span data-testid="country-value">{value}</span>
      <button data-testid="country-btn" onClick={() => onChange('AR')}>AR</button>
    </div>
  ),
}));

const defaultProps = {
  storeData: {
    name: '', phone: '', address: '', country: 'CL',
    city: null, coordinates: null,
  },
  suggestions: [],
  searchLoading: false,
  mapCenter: { lat: -33.4489, lng: -70.6693 },
  onChange: vi.fn(),
  onCountryChange: vi.fn(),
  onCityChange: vi.fn(),
  onSuggest: vi.fn(),
  onSearch: vi.fn(),
  onSave: vi.fn(),
  loading: false,
};

describe('SettingsTabStore', () => {
  it('renders store name and phone fields', () => {
    render(<SettingsTabStore {...defaultProps} />);
    expect(screen.getByText('Datos del Local')).toBeInTheDocument();
  });

  it('calls onChange when name field changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SettingsTabStore {...defaultProps} onChange={onChange} />);
    const inputs = screen.getAllByRole('textbox');
    // First input is the name field ("Nombre del local")
    await user.type(inputs[0], 'Test');
    expect(onChange).toHaveBeenCalled();
  });

  it('calls onCountryChange when country is selected', async () => {
    render(<SettingsTabStore {...defaultProps} />);
    await screen.getByTestId('country-btn').click();
    expect(defaultProps.onCountryChange).toHaveBeenCalledWith('AR');
  });

  it('calls onCityChange when city is selected', async () => {
    render(<SettingsTabStore {...defaultProps} />);
    await screen.getByTestId('city-btn').click();
    expect(defaultProps.onCityChange).toHaveBeenCalled();
  });

  it('renders the search box', () => {
    render(<SettingsTabStore {...defaultProps} />);
    expect(screen.getByTestId('search-box')).toBeInTheDocument();
  });

  it('renders the map preview', () => {
    render(<SettingsTabStore {...defaultProps} />);
    expect(screen.getByTestId('map-preview')).toBeInTheDocument();
  });

  it('renders the save button', () => {
    render(<SettingsTabStore {...defaultProps} />);
    expect(screen.getByText('Guardar Cambios')).toBeInTheDocument();
  });

  it('calls onSave when save button is clicked', async () => {
    const onSave = vi.fn();
    render(<SettingsTabStore {...defaultProps} onSave={onSave} />);
    await screen.getByText('Guardar Cambios').click();
    expect(onSave).toHaveBeenCalled();
  });
});