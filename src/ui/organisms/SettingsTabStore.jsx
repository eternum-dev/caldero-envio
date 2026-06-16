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
    <div className="bg-surface border border-gold/18 rounded-[14px] p-5">
      <h3 className="font-display text-display-sm font-semibold text-ink mb-6">Datos del Local</h3>

      <div className="flex flex-col gap-4">
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
          <label className="block font-sans text-label uppercase tracking-widest text-muted mb-1.5">
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

        <div>
          <MapPreview
            origin={storeData.coordinates || mapCenter}
            center={mapCenter}
            destination={null}
            routeCalculated={true}
            className="w-full"
          />
        </div>

        <Button variant="primary" size="md" className="w-fit" onClick={onSave} loading={loading}>
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
