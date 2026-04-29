import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';
import { ROUTES } from '../utils/constants';
import OnboardingLayout from '../ui/templates/OnboardingLayout';
import FormField from '../ui/molecules/FormField';
import Button from '../ui/atoms/Button';
import Icon from '../ui/atoms/Icon';
import CountrySelect from '../ui/molecules/CountrySelect';
import SearchBox from '../ui/molecules/SearchBox';
import MapPreview from '../ui/molecules/MapPreview';
import { getAddressSuggestions } from '../services/mapService';

const STEPS = [
  { id: 1, name: 'Tu Local', description: 'Datos del negocio' },
  { id: 2, name: 'Repartidores', description: 'Agrega tu equipo' },
  { id: 3, name: 'Tarifas', description: 'Configura precios' },
  { id: 4, name: 'Listo', description: 'Comenzar' },
];

const COUNTRY_CENTERS = {
  AR: { lat: -34.6037, lng: -58.3816 }, // Buenos Aires
  CL: { lat: -33.4489, lng: -70.6693 }, // Santiago
  CO: { lat: 4.7110, lng: -74.0721 }, // Bogotá
  MX: { lat: 19.4326, lng: -99.1332 }, // Ciudad de México
  PE: { lat: -12.0464, lng: -77.0428 }, // Lima
  UY: { lat: -34.9011, lng: -56.1645 }, // Montevideo
  PY: { lat: -25.2637, lng: -57.5759 }, // Asunción
  BO: { lat: -16.5000, lng: -68.1500 }, // La Paz
  EC: { lat: -0.1807, lng: -78.4678 }, // Quito
  BR: { lat: -15.7975, lng: -47.8919 }, // Brasilia
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const { saveStore, addCourier, savePricingRules } = useStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [storeData, setStoreData] = useState({
    name: '',
    phone: '',
    address: '',
    country: 'CL',
    coordinates: null,
    mapCenter: COUNTRY_CENTERS.CL,
  });

  const [couriers, setCouriers] = useState([]);
  const [newCourier, setNewCourier] = useState({ name: '', phone: '' });
  const [suggestions, setSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [pricingRules, setPricingRules] = useState([
    { minKm: 0, maxKm: 3, price: 500 },
    { minKm: 3, maxKm: 5, price: 700 },
    { minKm: 5, maxKm: 10, price: 1000 },
  ]);

  const countryCode = storeData.country.toLowerCase();

  const handleSuggest = useMemo(() => {
    return async address => {
      if (!address || !address.trim()) {
        setSuggestions([]);
        return;
      }
      setSearchLoading(true);
      try {
        const results = await getAddressSuggestions(address, countryCode);
        setSuggestions(results);
      } catch (err) {
        setSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    };
  }, [countryCode]);

  const handleSearch = useCallback((address, coordinates) => {
    setStoreData(prev => ({
      ...prev,
      address,
      coordinates,
      mapCenter: coordinates,
    }));
    setSuggestions([]);
  }, []);

  const handleAddCourier = () => {
    if (!newCourier.name.trim() || !newCourier.phone.trim()) return;
    setCouriers([...couriers, { ...newCourier, id: Date.now().toString() }]);
    setNewCourier({ name: '', phone: '' });
  };

  const handleRemoveCourier = id => {
    setCouriers(couriers.filter(c => c.id !== id));
  };

  const handlePricingChange = (index, field, value) => {
    const updated = [...pricingRules];
    const parsedValue = value === '' ? null : parseFloat(value);
    updated[index] = { ...updated[index], [field]: parsedValue };
    setPricingRules(updated);
  };

  const handleAddPricingRule = () => {
    setPricingRules([...pricingRules, { minKm: 0, maxKm: null, price: 0 }]);
  };

  const handleRemovePricingRule = index => {
    setPricingRules(pricingRules.filter((_, i) => i !== index));
  };

  const handleNext = async () => {
    setError('');

    if (currentStep === 1) {
      if (!storeData.name || !storeData.phone || !storeData.address || !storeData.coordinates) {
        setError('Completa todos los campos');
        return;
      }
    }

    if (currentStep === 2 && couriers.length === 0) {
      setError('Agrega al menos un repartidor');
      return;
    }

    if (currentStep === 3) {
      setLoading(true);
      try {
        await saveStore({
          name: storeData.name,
          phone: storeData.phone,
          address: storeData.address,
          country: storeData.country,
          originCoordinates: storeData.coordinates,
        });

        for (const courier of couriers) {
          await addCourier(courier);
        }

        await savePricingRules(pricingRules);

        await updateUser({ hasCompletedOnboarding: true });

        navigate(ROUTES.APP);
        return;
      } catch {
        setError('Error al guardar. Intenta de nuevo.');
      } finally {
        setLoading(false);
      }
      return;
    }

    setCurrentStep(currentStep + 1);
  };

  return (
    <OnboardingLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-on_surface">{STEPS[currentStep - 1].name}</h2>
        <p className="text-on-surface-variant">{STEPS[currentStep - 1].description}</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-error-container rounded-md text-secondary text-sm">{error}</div>
      )}

      {currentStep === 1 && (
        <div className="space-y-4">
          <FormField
            label="Nombre del local"
            value={storeData.name}
            onChange={e => setStoreData({ ...storeData, name: e.target.value })}
            placeholder="Pizzería Don Luigi"
            required
          />

          <FormField
            label="Teléfono de contacto"
            type="tel"
            value={storeData.phone}
            onChange={e => setStoreData({ ...storeData, phone: e.target.value })}
            placeholder="+54 11 1234-5678"
            required
          />

          <CountrySelect
            label="País"
            value={storeData.country}
            onChange={country => {
              const newCenter = COUNTRY_CENTERS[country] || COUNTRY_CENTERS.CL;
              setStoreData(prev => ({
                ...prev,
                country,
                mapCenter: newCenter,
                coordinates: null,
                address: '',
              }));
            }}
          />

          <div>
            <label className="block text-label text-sm text-on-surface-variant mb-2 tracking-label">
              Dirección del local
            </label>
            <SearchBox
              placeholder="Buscá la dirección de tu local..."
              onSearch={handleSearch}
              onSuggest={handleSuggest}
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
      )}

      {currentStep === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant mb-4">
            Agrega los repartidores que realizarán entregas.
          </p>

          <div className="flex gap-2">
            <FormField
              label="Nombre"
              value={newCourier.name}
              onChange={e => setNewCourier({ ...newCourier, name: e.target.value })}
              placeholder="Juan Pérez"
              className="flex-1"
            />
            <FormField
              label="Teléfono"
              value={newCourier.phone}
              onChange={e => setNewCourier({ ...newCourier, phone: e.target.value })}
              placeholder="+54 11 9876-5432"
              className="flex-1"
            />
            <div className="flex items-end">
              <Button type="button" variant="secondary" onClick={handleAddCourier}>
                <Icon name="plus" className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            {couriers.map(courier => (
              <div
                key={courier.id}
                className="flex items-center justify-between p-4 bg-surface-low rounded-md"
              >
                <div>
                  <p className="font-medium text-on_surface">{courier.name}</p>
                  <p className="text-sm text-on-surface-variant">{courier.phone}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveCourier(courier.id)}
                >
                  <Icon name="x" className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant mb-4">
            Configura las tarifas según distancia. El precio se aplica al rango correspondiente.
          </p>

          <div className="space-y-3">
            {pricingRules.map((rule, index) => (
              <div key={index} className="flex gap-2 items-end">
                <FormField
                  label="Desde (km)"
                  type="number"
                  step="0.1"
                  value={rule.minKm}
                  onChange={e => handlePricingChange(index, 'minKm', e.target.value)}
                  className="w-24"
                />
                <FormField
                  label="Hasta (km)"
                  type="number"
                  step="0.1"
                  value={rule.maxKm ?? ''}
                  onChange={e => handlePricingChange(index, 'maxKm', e.target.value)}
                  placeholder="∞"
                  className="w-24"
                />
                <FormField
                  label="Precio ($)"
                  type="number"
                  value={rule.price}
                  onChange={e => handlePricingChange(index, 'price', e.target.value)}
                  className="w-32"
                />
                {pricingRules.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemovePricingRule(index)}
                  >
                    <Icon name="x" className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button type="button" variant="tertiary" onClick={handleAddPricingRule} className="mt-2">
            <Icon name="plus" className="w-4 h-4 mr-2" />
            Agregar regla
          </Button>
        </div>
      )}

      {currentStep === 4 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="check" className="w-8 h-8 text-secondary" />
          </div>
          <h3 className="text-xl font-semibold text-on_surface mb-2">¡Todo listo!</h3>
          <p className="text-on-surface-variant mb-6">
            Tu local está configurado. Ya puedes comenzar a calcular envíos.
          </p>
        </div>
      )}

      <div className="flex justify-between mt-8">
        {currentStep > 1 ? (
          <Button type="button" variant="ghost" onClick={() => setCurrentStep(currentStep - 1)}>
            <Icon name="chevronLeft" className="w-5 h-5 mr-2" />
            Anterior
          </Button>
        ) : (
          <div />
        )}

        <Button type="button" variant="primary" onClick={handleNext} loading={loading}>
          {currentStep === STEPS.length ? 'Comenzar' : 'Siguiente'}
          <Icon name="chevronRight" className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </OnboardingLayout>
  );
}
