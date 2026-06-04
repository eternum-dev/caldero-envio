import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OnboardingStepStore from '../../../src/ui/organisms/OnboardingStepStore';

// Mock MapPreview and SearchBox since they depend on Mapbox
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
  default: ({ onChange, country, value }) => (
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
    city: null, coordinates: null, mapCenter: { lat: -33.4489, lng: -70.6693 },
  },
  onStoreDataChange: vi.fn(),
  onCountryChange: vi.fn(),
  onCityChange: vi.fn(),
  onSuggest: vi.fn(),
  onSearch: vi.fn(),
  suggestions: [],
  searchLoading: false,
};

describe('OnboardingStepStore', () => {
  it('renders store name and phone fields', () => {
    render(<OnboardingStepStore {...defaultProps} />);
    expect(screen.getByPlaceholderText('Pizzería Don Luigi')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('+54 11 1234-5678')).toBeInTheDocument();
  });

  it('calls onStoreDataChange when name field changes', async () => {
    const user = userEvent.setup();
    render(<OnboardingStepStore {...defaultProps} />);
    const nameInput = screen.getByPlaceholderText('Pizzería Don Luigi');
    await user.type(nameInput, 'Test');
    expect(defaultProps.onStoreDataChange).toHaveBeenCalled();
  });

  it('calls onStoreDataChange when phone field changes', async () => {
    const user = userEvent.setup();
    render(<OnboardingStepStore {...defaultProps} />);
    const phoneInput = screen.getByPlaceholderText('+54 11 1234-5678');
    await user.type(phoneInput, '123');
    expect(defaultProps.onStoreDataChange).toHaveBeenCalled();
  });

  it('calls onCountryChange when country is selected', async () => {
    render(<OnboardingStepStore {...defaultProps} />);
    const countryBtn = screen.getByTestId('country-btn');
    await countryBtn.click();
    expect(defaultProps.onCountryChange).toHaveBeenCalledWith('AR');
  });

  it('calls onCityChange when city is selected', async () => {
    render(<OnboardingStepStore {...defaultProps} />);
    const cityBtn = screen.getByTestId('city-btn');
    await cityBtn.click();
    expect(defaultProps.onCityChange).toHaveBeenCalled();
  });

  it('renders the search box', () => {
    render(<OnboardingStepStore {...defaultProps} />);
    expect(screen.getByTestId('search-box')).toBeInTheDocument();
  });

  it('renders the map preview', () => {
    render(<OnboardingStepStore {...defaultProps} />);
    expect(screen.getByTestId('map-preview')).toBeInTheDocument();
  });
});