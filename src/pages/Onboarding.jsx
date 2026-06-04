import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';
import { ROUTES, COUNTRY_CENTERS } from '../utils/constants';
import { validateCourierName, validatePhone, validatePricingRules } from '../utils/validators';
import { getAddressSuggestions, getOffsetByPopulation, createBBox } from '../services/mapService';
import OnboardingLayout from '../ui/templates/OnboardingLayout';
import OnboardingStepStore from '../ui/organisms/OnboardingStepStore';
import OnboardingStepCouriers from '../ui/organisms/OnboardingStepCouriers';
import OnboardingStepPricing from '../ui/organisms/OnboardingStepPricing';
import OnboardingStepSuccess from '../ui/organisms/OnboardingStepSuccess';
import Button from '../ui/atoms/Button';
import Icon from '../ui/atoms/Icon';

const STEPS = [
  { id: 1, name: 'Tu Local', description: 'Datos del negocio' },
  { id: 2, name: 'Repartidores', description: 'Agrega tu equipo' },
  { id: 3, name: 'Tarifas', description: 'Configura precios' },
  { id: 4, name: '', description: '' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const { saveStore, addCourier, savePricingRules } = useStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [storeData, setStoreData] = useState({
    name: '', phone: '', address: '', country: 'CL', city: null,
    coordinates: null, mapCenter: COUNTRY_CENTERS.CL,
  });
  const [couriers, setCouriers] = useState([]);
  const [newCourier, setNewCourier] = useState({ name: '', phone: '' });
  const [courierErrors, setCourierErrors] = useState({ nameError: null, phoneError: null });
  const [suggestions, setSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [pricingRules, setPricingRules] = useState([
    { minKm: 0, maxKm: 3, price: 500 }, { minKm: 3, maxKm: 5, price: 700 }, { minKm: 5, maxKm: 10, price: 1000 },
  ]);
  const [pricingErrors, setPricingErrors] = useState([]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const countryCode = storeData.country.toLowerCase();

  const handleSuggest = useMemo(() => async address => {
    if (!address?.trim()) { setSuggestions([]); return; }
    setSearchLoading(true);
    try { setSuggestions(await getAddressSuggestions(address, countryCode, storeData.city?.bbox || null)); }
    catch { setSuggestions([]); } finally { setSearchLoading(false); }
  }, [countryCode, storeData.city]);

  const handleSearch = useCallback((address, coordinates) => {
    setStoreData(prev => ({ ...prev, address, coordinates, mapCenter: coordinates }));
    setSuggestions([]);
  }, []);

  const handleCountryChange = country => {
    const newCenter = COUNTRY_CENTERS[country] || COUNTRY_CENTERS.CL;
    setStoreData(prev => ({ ...prev, country, city: null, mapCenter: newCenter, coordinates: null, address: '' }));
  };

  const handleCityChange = city => {
    if (!city) { setStoreData(prev => ({ ...prev, city: null })); return; }
    const offset = getOffsetByPopulation(city.population);
    const bbox = createBBox(city.center.lng, city.center.lat, offset);
    setStoreData(prev => ({ ...prev, city: { name: city.name, center: { lng: city.center.lng, lat: city.center.lat }, bbox, population: city.population } }));
  };

  const handleAddCourier = () => {
    const nameError = validateCourierName(newCourier.name);
    const phoneError = validatePhone(newCourier.phone);
    if (nameError || phoneError) { setCourierErrors({ nameError, phoneError }); return; }
    if (!newCourier.name.trim() || !newCourier.phone.trim()) return;
    setCouriers([...couriers, { ...newCourier, id: Date.now().toString() }]);
    setNewCourier({ name: '', phone: '' }); setCourierErrors({ nameError: null, phoneError: null });
  };

  const handlePricingChange = (index, field, value) => {
    const updated = [...pricingRules];
    updated[index] = { ...updated[index], [field]: value === '' ? null : parseFloat(value) };
    setPricingRules(updated); setPricingErrors(validatePricingRules(updated));
  };

  const handleNext = async () => {
    setError('');
    if (currentStep === 1 && (!storeData.name || !storeData.phone || !storeData.address || !storeData.coordinates)) {
      setError('Completa todos los campos'); return;
    }
    if (currentStep === 2 && couriers.length === 0) { setError('Agrega al menos un repartidor'); return; }
    if (currentStep === 3) {
      const errors = validatePricingRules(pricingRules); setPricingErrors(errors);
      if (errors.some(e => e !== null)) return;
      setLoading(true);
      try {
        await saveStore({ name: storeData.name, phone: storeData.phone, address: storeData.address, country: storeData.country, city: storeData.city, originCoordinates: storeData.coordinates });
        for (const c of couriers) await addCourier(c);
        await savePricingRules(pricingRules); await updateUser({ hasCompletedOnboarding: true });
        setSaveSuccess(true); setCurrentStep(4); return;
      } catch { setError('Error al guardar. Intenta de nuevo.'); } finally { setLoading(false); }
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const hasPricingErrors = pricingErrors.some(e => e !== null);

  return (
    <OnboardingLayout currentStep={currentStep} totalSteps={STEPS.length}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-on_surface">{STEPS[currentStep - 1].name}</h2>
        <p className="text-on-surface-variant">{STEPS[currentStep - 1].description}</p>
      </div>
      {error && <div className="mb-4 p-3 bg-error-container rounded-md text-secondary text-sm">{error}</div>}
      {currentStep === 1 && <OnboardingStepStore storeData={storeData} onStoreDataChange={setStoreData} onCountryChange={handleCountryChange} onCityChange={handleCityChange} onSuggest={handleSuggest} onSearch={handleSearch} suggestions={suggestions} searchLoading={searchLoading} />}
      {currentStep === 2 && <OnboardingStepCouriers couriers={couriers} newCourier={newCourier} courierErrors={courierErrors} onNewCourierChange={update => { setNewCourier(update); setCourierErrors(prev => ({ ...prev, nameError: null, phoneError: null })); }} onAddCourier={handleAddCourier} onRemoveCourier={id => setCouriers(couriers.filter(c => c.id !== id))} />}
      {currentStep === 3 && <OnboardingStepPricing pricingRules={pricingRules} pricingErrors={pricingErrors} onPricingChange={handlePricingChange} onAddRule={() => setPricingRules([...pricingRules, { minKm: 0, maxKm: null, price: 0 }])} onRemoveRule={i => setPricingRules(pricingRules.filter((_, idx) => idx !== i))} />}
      {currentStep === 4 && saveSuccess && <OnboardingStepSuccess onNavigate={() => navigate(ROUTES.APP)} />}
      {currentStep !== 4 && (
        <div className="flex justify-between mt-8">
          {currentStep > 1 ? <Button type="button" variant="ghost" onClick={() => setCurrentStep(currentStep - 1)}><Icon name="chevronLeft" className="w-5 h-5 mr-2" />Anterior</Button> : <div />}
          <Button type="button" variant="primary" onClick={handleNext} loading={currentStep === 3 ? loading : false} disabled={currentStep === 2 ? !!courierErrors.nameError || !!courierErrors.phoneError : currentStep === 3 ? hasPricingErrors : false}>
            Siguiente<Icon name="chevronRight" className="w-5 h-5 ml-2" />
          </Button>
        </div>
      )}
    </OnboardingLayout>
  );
}