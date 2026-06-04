import PropTypes from 'prop-types';
import FormField from '../molecules/FormField';
import CountrySelect from '../molecules/CountrySelect';
import CitySelect from '../molecules/CitySelect';
import SearchBox from '../molecules/SearchBox';
import MapPreview from '../molecules/MapPreview';
import Button from '../atoms/Button';

/**
 * Settings tab: store details form with name, phone, country, city, address search, map preview.
 * Pure presentational — all state and handlers live in the parent Settings page.
 */
export default function SettingsTabStore({
  storeData,
  suggestions,
  searchLoading,
  mapCenter,
  onChange,
  onCountryChange,
  onCityChange,
  onSuggest,
  onSearch,
  onSave,
  loading,
}) {
  return (
    <div className="bg-surface-medium rounded-md p-6">
      <h3 className="text-lg font-semibold text-on_surface mb-6">Datos del Local</h3>

      <div className="space-y-4">
        <FormField
          label="Nombre del local"
          value={storeData.name}
          onChange={e => onChange({ ...storeData, name: e.target.value })}
        />

        <FormField
          label="Teléfono"
          value={storeData.phone}
          onChange={e => onChange({ ...storeData, phone: e.target.value })}
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
            origin={storeData.coordinates || mapCenter}
            center={mapCenter}
            destination={null}
            routeCalculated={true}
            className="w-full"
            style={{ height: '200px' }}
          />
        </div>

        <Button variant="primary" onClick={onSave} loading={loading}>
          Guardar Cambios
        </Button>
      </div>
    </div>
  );
}

SettingsTabStore.propTypes = {
  storeData: PropTypes.shape({
    name: PropTypes.string,
    phone: PropTypes.string,
    address: PropTypes.string,
    country: PropTypes.string,
    city: PropTypes.object,
    coordinates: PropTypes.object,
  }).isRequired,
  suggestions: PropTypes.array,
  searchLoading: PropTypes.bool,
  mapCenter: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onCountryChange: PropTypes.func.isRequired,
  onCityChange: PropTypes.func.isRequired,
  onSuggest: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};