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

const STEP_ICONS = ['location', 'user', 'truck', 'check'];
const STEP_BG_CLASSES = [
  'bg-amber-500/20 text-amber-400',
  'bg-blue-500/20 text-blue-400',
  'bg-green-500/20 text-green-400',
  'bg-emerald-500/20 text-emerald-400',
];

function StepHeader({ step, name, description }) {
  return (
    <div className="flex items-start gap-4 mb-6">
      <span
        className={`inline-flex items-center justify-center w-11 h-11 rounded-full shrink-0 ${STEP_BG_CLASSES[step - 1] || 'bg-primary/20 text-primary'}`}
      >
        <Icon name={STEP_ICONS[step - 1]} className="w-5 h-5" />
      </span>
      <div>
        <h2 className="text-2xl font-bold text-on_surface">{name}</h2>
        {description && <p className="text-on-surface-variant mt-0.5">{description}</p>}
      </div>
    </div>
  );
}

function ErrorBanner({ error, onDismiss }) {
  if (!error) return null;
  return (
    <div
      className="mb-4 p-4 bg-error-container rounded-md flex items-start gap-3 animate-slide-up"
      role="alert"
    >
      <Icon name="x" className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
      <span className="text-secondary text-sm flex-1">{error}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="text-secondary/60 hover:text-secondary transition-colors shrink-0"
        aria-label="Cerrar"
      >
        <Icon name="x" className="w-4 h-4" />
      </button>
    </div>
  );
}

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
    city: null,
    coordinates: null,
    mapCenter: COUNTRY_CENTERS.CL,
  });
  const [couriers, setCouriers] = useState([]);
  const [newCourier, setNewCourier] = useState({ name: '', phone: '' });
  const [courierErrors, setCourierErrors] = useState({ nameError: null, phoneError: null });
  const [suggestions, setSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [pricingRules, setPricingRules] = useState([
    { minKm: 0, maxKm: 3, price: 500 },
    { minKm: 3, maxKm: 5, price: 700 },
    { minKm: 5, maxKm: 10, price: 1000 },
  ]);
  const [pricingErrors, setPricingErrors] = useState([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const countryCode = storeData.country.toLowerCase();
  const isLastStep = currentStep === 4;
  const currentMeta = STEPS[currentStep - 1];

  // ── Handlers ──────────────────────────────────

  const handleSuggest = useMemo(
    () => async address => {
      if (!address?.trim()) {
        setSuggestions([]);
        return;
      }
      setSearchLoading(true);
      try {
        setSuggestions(
          await getAddressSuggestions(address, countryCode, storeData.city?.bbox || null)
        );
      } catch {
        setSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    },
    [countryCode, storeData.city]
  );

  const handleSearch = useCallback((address, coordinates) => {
    setStoreData(prev => ({ ...prev, address, coordinates, mapCenter: coordinates }));
    setSuggestions([]);
  }, []);

  const handleCountryChange = useCallback(country => {
    const newCenter = COUNTRY_CENTERS[country] || COUNTRY_CENTERS.CL;
    setStoreData(prev => ({
      ...prev,
      country,
      city: null,
      mapCenter: newCenter,
      coordinates: null,
      address: '',
    }));
  }, []);

  const handleCityChange = useCallback(city => {
    if (!city) {
      setStoreData(prev => ({ ...prev, city: null }));
      return;
    }
    const bbox = createBBox(city.center.lng, city.center.lat, getOffsetByPopulation(city.population));
    setStoreData(prev => ({
      ...prev,
      city: { name: city.name, center: { lng: city.center.lng, lat: city.center.lat }, bbox, population: city.population ?? 0 },
    }));
  }, []);

  const handleAddCourier = useCallback(() => {
    const nameError = validateCourierName(newCourier.name);
    const phoneError = validatePhone(newCourier.phone);
    if (nameError || phoneError) {
      setCourierErrors({ nameError, phoneError });
      return;
    }
    if (!newCourier.name.trim() || !newCourier.phone.trim()) return;
    setCouriers(prev => [...prev, { ...newCourier, id: Date.now().toString() }]);
    setNewCourier({ name: '', phone: '' });
    setCourierErrors({ nameError: null, phoneError: null });
  }, [newCourier]);

  const handleRemoveCourier = useCallback(id => setCouriers(prev => prev.filter(c => c.id !== id)), []);

  const handleNewCourierChange = useCallback(update => {
    setNewCourier(update);
    setCourierErrors(prev => ({ ...prev, nameError: null, phoneError: null }));
  }, []);

  const handlePricingChange = useCallback((index, field, value) => {
    setPricingRules(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value === '' ? null : parseFloat(value) };
      setPricingErrors(validatePricingRules(updated));
      return updated;
    });
  }, []);

  const handleAddRule = useCallback(() => {
    setPricingRules(prev => [...prev, { minKm: 0, maxKm: null, price: 0 }]);
  }, []);

  const handleRemoveRule = useCallback(i => setPricingRules(prev => prev.filter((_, idx) => idx !== i)), []);

  const handleBack = useCallback(() => setCurrentStep(prev => Math.max(1, prev - 1)), []);

  // ── Validation (separada del handler de guardado) ──

  function validateCurrentStep() {
    if (currentStep === 1 && (!storeData.name || !storeData.phone || !storeData.address || !storeData.coordinates)) {
      setError('Completa todos los campos');
      return false;
    }
    if (currentStep === 2 && couriers.length === 0) {
      setError('Agrega al menos un repartidor');
      return false;
    }
    if (currentStep === 3) {
      const errors = validatePricingRules(pricingRules);
      setPricingErrors(errors);
      if (errors.some(e => e !== null)) return false;
    }
    return true;
  }

  // ── Save (separada de la validación) ──

  async function saveAndAdvance() {
    setLoading(true);
    try {
      await saveStore({
        name: storeData.name, phone: storeData.phone, address: storeData.address,
        country: storeData.country, city: storeData.city, originCoordinates: storeData.coordinates,
      });
      for (const c of couriers) await addCourier(c);
      await savePricingRules(pricingRules);
      await updateUser({ hasCompletedOnboarding: true });
      setSaveSuccess(true);
      setCurrentStep(4);
    } catch {
      setError('Error al guardar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  // ── Orchestrator ────────────────────────────

  const handleNext = useCallback(async () => {
    setError('');
    if (!validateCurrentStep()) return;
    if (currentStep === 3) { await saveAndAdvance(); return; }
    setCurrentStep(prev => prev + 1);
  }, [currentStep, storeData, couriers, pricingRules, saveStore, addCourier, savePricingRules, updateUser]);

  // ── Derived state ────────────────────────────

  const hasPricingErrors = pricingErrors.some(e => e !== null);

  const isNextDisabled = useMemo(() => {
    if (currentStep === 2) return !!courierErrors.nameError || !!courierErrors.phoneError;
    if (currentStep === 3) return hasPricingErrors;
    return false;
  }, [currentStep, courierErrors, hasPricingErrors]);

  // ── Render helpers (inline, sin useMemo — evita deps frágiles) ──

  function renderStep() {
    switch (currentStep) {
      case 1: return (
        <OnboardingStepStore
          storeData={storeData} onStoreDataChange={setStoreData}
          onCountryChange={handleCountryChange} onCityChange={handleCityChange}
          onSuggest={handleSuggest} onSearch={handleSearch}
          suggestions={suggestions} searchLoading={searchLoading}
        />
      );
      case 2: return (
        <OnboardingStepCouriers
          couriers={couriers} newCourier={newCourier} courierErrors={courierErrors}
          onNewCourierChange={handleNewCourierChange} onAddCourier={handleAddCourier}
          onRemoveCourier={handleRemoveCourier}
        />
      );
      case 3: return (
        <OnboardingStepPricing
          pricingRules={pricingRules} pricingErrors={pricingErrors}
          onPricingChange={handlePricingChange} onAddRule={handleAddRule}
          onRemoveRule={handleRemoveRule}
        />
      );
      case 4: return saveSuccess ? <OnboardingStepSuccess onNavigate={() => navigate(ROUTES.APP)} /> : null;
      default: return null;
    }
  }

  // ── Render ────────────────────────────────────

  return (
    <OnboardingLayout currentStep={currentStep} totalSteps={STEPS.length}>
      {!isLastStep && <StepHeader step={currentStep} name={currentMeta.name} description={currentMeta.description} />}
      <ErrorBanner error={error} onDismiss={() => setError('')} />
      <div key={currentStep} className="animate-fade-in">{renderStep()}</div>
      {!isLastStep && (
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-surface-high">
          {currentStep > 1 ? (
            <Button type="button" variant="ghost" onClick={handleBack}>
              <Icon name="chevronLeft" className="w-5 h-5 mr-2" /> Anterior
            </Button>
          ) : <div />}
          <Button type="button" variant="primary" onClick={handleNext}
            loading={currentStep === 3 ? loading : false} disabled={isNextDisabled}
          >
            {currentStep === 3 ? 'Guardar' : 'Siguiente'}
            {currentStep < 3 && <Icon name="chevronRight" className="w-5 h-5 ml-2" />}
          </Button>
        </div>
      )}
    </OnboardingLayout>
  );
}
