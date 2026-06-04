import PropTypes from 'prop-types';
import FormField from '../molecules/FormField';
import CountrySelect from '../molecules/CountrySelect';
import CitySelect from '../molecules/CitySelect';
import SearchBox from '../molecules/SearchBox';
import MapPreview from '../molecules/MapPreview';

/**
 * Step 1 of onboarding: captures store name, phone, country, city, address, and map pin.
 * Pure presentational — all state lives in the parent orchestrator.
 */
export default function OnboardingStepStore({
  storeData,
  onStoreDataChange,
  onCountryChange,
  onCityChange,
  onSuggest,
  onSearch,
  suggestions,
  searchLoading,
}) {
  return (
    <div className="space-y-4">
      <FormField
        label="Nombre del local"
        value={storeData.name}
        onChange={e => onStoreDataChange({ ...storeData, name: e.target.value })}
        placeholder="Pizzería Don Luigi"
        required
      />

      <FormField
        label="Teléfono de contacto"
        type="tel"
        value={storeData.phone}
        onChange={e => onStoreDataChange({ ...storeData, phone: e.target.value })}
        placeholder="+54 11 1234-5678"
        required
      />

      <div className="flex gap-4">
        <CountrySelect
          label="País"
          value={storeData.country}
          onChange={onCountryChange}
          className="flex-1"
        />
        <CitySelect
          label="Ciudad"
          value={storeData.city}
          onChange={onCityChange}
          country={storeData.country}
          className="flex-1"
        />
      </div>

      <div>
        <label className="block text-label text-sm text-on-surface-variant mb-2 tracking-label">
          Dirección del local
        </label>
        <SearchBox
          placeholder="Buscá la dirección de tu local..."
          onSearch={onSearch}
          onSuggest={onSuggest}
          suggestions={suggestions}
          debounceMs={500}
          loading={searchLoading}
        />
      </div>

      <div className="bg-surface-high rounded-md overflow-hidden">
        <MapPreview
          origin={storeData.coordinates || storeData.mapCenter}
          center={storeData.mapCenter}
          destination={null}
          className="w-full"
          style={{ height: '300px' }}
        />
      </div>
    </div>
  );
}

OnboardingStepStore.propTypes = {
  storeData: PropTypes.shape({
    name: PropTypes.string,
    phone: PropTypes.string,
    address: PropTypes.string,
    country: PropTypes.string,
    city: PropTypes.object,
    coordinates: PropTypes.object,
    mapCenter: PropTypes.object,
  }).isRequired,
  onStoreDataChange: PropTypes.func.isRequired,
  onCountryChange: PropTypes.func.isRequired,
  onCityChange: PropTypes.func.isRequired,
  onSuggest: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  suggestions: PropTypes.array,
  searchLoading: PropTypes.bool,
};