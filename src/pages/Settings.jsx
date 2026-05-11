import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';
import SettingsLayout from '../ui/templates/SettingsLayout';
import FormField from '../ui/molecules/FormField';
import Button from '../ui/atoms/Button';
import Icon from '../ui/atoms/Icon';
import Badge from '../ui/atoms/Badge';
import CountrySelect from '../ui/molecules/CountrySelect';
import SearchBox from '../ui/molecules/SearchBox';
import MapPreview from '../ui/molecules/MapPreview';
import { useEffect } from 'react';
import { getAddressSuggestions } from '../services/mapService';

const COUNTRY_CENTERS = {
  AR: { lat: -34.6037, lng: -58.3816 },
  CL: { lat: -33.4489, lng: -70.6693 },
  CO: { lat: 4.7110, lng: -74.0721 },
  MX: { lat: 19.4326, lng: -99.1332 },
  PE: { lat: -12.0464, lng: -77.0428 },
  UY: { lat: -34.9011, lng: -56.1645 },
  PY: { lat: -25.2637, lng: -57.5759 },
  BO: { lat: -16.5000, lng: -68.1500 },
  EC: { lat: -0.1807, lng: -78.4678 },
  BR: { lat: -15.7975, lng: -47.8919 },
};

function validateCourierName(name) {
  if (!name || name.trim().length < 2) {
    return 'Nombre debe tener al menos 2 caracteres';
  }
  if (/^\d+$/.test(name.trim())) {
    return 'Nombre no puede ser solo números';
  }
  return null;
}

function validatePhone(phone) {
  if (!phone || phone.replace(/\D/g, '').length < 8) {
    return 'Teléfono debe tener al menos 8 dígitos';
  }
  if (!/^\+?[\d\s]+$/.test(phone)) {
    return 'Teléfono solo puede tener números y +';
  }
  return null;
}

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { store, couriers, saveStore, addCourier, removeCourier, updateCourier, savePricingRules } = useStore();
  const [activeTab, setActiveTab] = useState('store');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [storeData, setStoreData] = useState({
    name: store?.name || '',
    phone: store?.phone || '',
    address: store?.address || '',
    country: store?.country || 'CL',
    coordinates: store?.originCoordinates || null,
  });

  useEffect(() => {
    if (store) {
      setStoreData({
        name: store.name || '',
        phone: store.phone || '',
        address: store.address || '',
        country: store.country || 'CL',
        coordinates: store.originCoordinates || null,
      });
    }
  }, [store]);

  const [suggestions, setSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Sync pricingRules when store loads
  useEffect(() => {
    if (store?.pricingRules && store.pricingRules.length > 0) {
      setPricingRules(store.pricingRules);
    }
  }, [store?.pricingRules]);

  const handleSuggest = useMemo(() => {
    return async address => {
      if (!address || !address.trim()) {
        setSuggestions([]);
        return;
      }
      setSearchLoading(true);
      try {
        const results = await getAddressSuggestions(address, storeData.country?.toLowerCase() || 'cl');
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    };
  }, [storeData.country]);

  const handleStoreSearch = (address, coordinates) => {
    setStoreData(prev => ({ ...prev, address, coordinates }));
    setSuggestions([]);
  };

  const [newCourier, setNewCourier] = useState({ name: '', phone: '' });
  const [pricingRules, setPricingRules] = useState(
    store?.pricingRules || [{ minKm: 0, maxKm: 3, price: 500 }]
  );
  const [editingCourierId, setEditingCourierId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '' });
  const [editErrors, setEditErrors] = useState({ nameError: null, phoneError: null });

  const handleSaveStore = async () => {
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      if (!storeData.coordinates) {
        setError('La dirección es requerida');
        return;
      }
      await saveStore({
        name: storeData.name,
        phone: storeData.phone,
        address: storeData.address,
        country: storeData.country,
        originCoordinates: storeData.coordinates,
      });
      setSuccess('Local guardado correctamente');
    } catch {
      setError('Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourier = async () => {
    if (!newCourier.name.trim() || !newCourier.phone.trim()) return;
    await addCourier(newCourier);
    setNewCourier({ name: '', phone: '' });
  };

  const handleEditClick = (courier) => {
    setEditingCourierId(courier.id);
    setEditForm({ name: courier.name, phone: courier.phone });
    setEditErrors({ nameError: null, phoneError: null });
  };

  const handleCancelEdit = () => {
    setEditingCourierId(null);
    setEditForm({ name: '', phone: '' });
    setEditErrors({ nameError: null, phoneError: null });
  };

  const handleSaveEdit = async () => {
    const nameError = validateCourierName(editForm.name);
    const phoneError = validatePhone(editForm.phone);

    if (nameError || phoneError) {
      setEditErrors({ nameError, phoneError });
      return;
    }

    await updateCourier(editingCourierId, editForm);
    setEditingCourierId(null);
    setEditForm({ name: '', phone: '' });
    setEditErrors({ nameError: null, phoneError: null });
  };

  const handleSavePricing = async () => {
    setLoading(true);
    try {
      await savePricingRules(pricingRules);
      setSuccess('Tarifas guardadas correctamente');
    } catch {
      setError('Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const handlePricingChange = (index, field, value) => {
    const updated = [...pricingRules];
    updated[index] = { ...updated[index], [field]: value };
    setPricingRules(updated);
  };

  const handleAddPricingRule = () => {
    setPricingRules(prev => [...prev, { minKm: 0, maxKm: null, price: 0 }]);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const mapCenter = COUNTRY_CENTERS[storeData.country] || COUNTRY_CENTERS.CL;

  return (
    <SettingsLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {success && (
        <div className="mb-4 p-3 bg-surface-low rounded-md text-secondary text-sm">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-error-container rounded-md text-secondary text-sm">
          {error}
        </div>
      )}

      {activeTab === 'store' && (
        <div className="bg-surface-medium rounded-md p-6">
          <h3 className="text-lg font-semibold text-on_surface mb-6">Datos del Local</h3>

          <div className="space-y-4">
            <FormField
              label="Nombre del local"
              value={storeData.name}
              onChange={e => setStoreData({ ...storeData, name: e.target.value })}
            />

            <FormField
              label="Teléfono"
              value={storeData.phone}
              onChange={e => setStoreData({ ...storeData, phone: e.target.value })}
            />

            <div>
              <label className="block text-label text-sm text-on-surface-variant mb-2 tracking-label">
                Dirección del local
              </label>
              <SearchBox
                placeholder="Buscá la dirección de tu local..."
                onSearch={handleStoreSearch}
                onSuggest={handleSuggest}
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

            <CountrySelect
              label="País"
              value={storeData.country}
              onChange={country => setStoreData({ ...storeData, country })}
            />

            <Button variant="primary" onClick={handleSaveStore} loading={loading}>
              Guardar Cambios
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'couriers' && (
        <div className="bg-surface-medium rounded-md p-6">
          <h3 className="text-lg font-semibold text-on_surface mb-6">Repartidores</h3>

          <div className="flex gap-2 mb-6">
            <FormField
              label="Nombre"
              value={newCourier.name}
              onChange={e => setNewCourier({ ...newCourier, name: e.target.value })}
              placeholder="Nombre"
              className="flex-1"
            />
            <FormField
              label="Teléfono"
              value={newCourier.phone}
              onChange={e => setNewCourier({ ...newCourier, phone: e.target.value })}
              placeholder="Teléfono"
              className="flex-1"
            />
            <div className="flex items-end">
              <Button variant="secondary" onClick={handleAddCourier}>
                <Icon name="plus" className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {couriers.map(courier => (
              <div
                key={courier.id}
                className="p-4 bg-surface-low rounded-md"
              >
                {editingCourierId === courier.id ? (
                  <div className="space-y-3">
                    <div className="flex gap-2 items-end">
                      <FormField
                        label="Nombre"
                        value={editForm.name}
                        onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        error={editErrors.nameError}
                        className="flex-1"
                      />
                      <FormField
                        label="Teléfono"
                        value={editForm.phone}
                        onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                        error={editErrors.phoneError}
                        className="flex-1"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                        Cancelar
                      </Button>
                      <Button variant="primary" size="sm" onClick={handleSaveEdit}>
                        Guardar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="primary">{courier.name.charAt(0)}</Badge>
                      <div>
                        <p className="font-medium text-on_surface">{courier.name}</p>
                        <p className="text-sm text-on-surface-variant">{courier.phone}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditClick(courier)}>
                        <Icon name="edit" className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => removeCourier(courier.id)}>
                        <Icon name="x" className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'pricing' && (
        <div className="bg-surface-medium rounded-md p-6">
          <h3 className="text-lg font-semibold text-on_surface mb-6">Tarifas por Distancia</h3>

          <div className="space-y-3">
            {pricingRules.map((rule, index) => (
              <div key={index} className="flex gap-2 items-end">
                <FormField
                  label="Desde (km)"
                  type="number"
                  step="0.1"
                  value={rule.minKm}
                  onChange={e => handlePricingChange(index, 'minKm', parseFloat(e.target.value))}
                  className="w-24"
                />
                <FormField
                  label="Hasta (km)"
                  type="number"
                  step="0.1"
                  value={rule.maxKm || ''}
                  onChange={e =>
                    handlePricingChange(
                      index,
                      'maxKm',
                      e.target.value ? parseFloat(e.target.value) : null
                    )
                  }
                  placeholder="∞"
                  className="w-24"
                />
                <FormField
                  label="Precio ($)"
                  type="number"
                  value={rule.price}
                  onChange={e => handlePricingChange(index, 'price', parseFloat(e.target.value))}
                  className="w-32"
                />
              </div>
            ))}
          </div>

          <Button variant="tertiary" onClick={handleAddPricingRule} className="mt-4">
            <Icon name="plus" className="w-4 h-4 mr-2" />
            Agregar regla
          </Button>

          <Button variant="primary" onClick={handleSavePricing} loading={loading} className="mt-6">
            Guardar Tarifas
          </Button>
        </div>
      )}

      <div className="mt-8 pt-8 border-t border-surface-low">
        <p className="text-sm text-on-surface-variant mb-2">Usuario: {user?.email}</p>
        <Button variant="tertiary" onClick={handleSignOut}>
          Cerrar Sesión
        </Button>
      </div>
    </SettingsLayout>
  );
}