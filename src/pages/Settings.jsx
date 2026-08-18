import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';
import SettingsLayout from '../ui/templates/SettingsLayout';
import SettingsTabStore from '../ui/organisms/SettingsTabStore';
import SettingsTabCouriers from '../ui/organisms/SettingsTabCouriers';
import SettingsTabPricing from '../ui/organisms/SettingsTabPricing';
import CalderosTabContent from '../ui/organisms/CalderosTabContent';
import SettingsSkeleton from '../ui/molecules/SettingsSkeleton';

import { getAddressSuggestions, getOffsetByPopulation, createBBox } from '../services/mapService';
import { validateCourierName, validatePhone } from '../utils/validators';
import { COUNTRY_CENTERS } from '../utils/constants';

export default function Settings() {
  const { store, couriers, saveStore, addCourier, removeCourier, updateCourier, saveCouriers, savePricingRules } = useStore();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('store');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [newCourier, setNewCourier] = useState({ name: '', phone: '' });
  const [editingCourierId, setEditingCourierId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '' });
  const [editErrors, setEditErrors] = useState({ nameError: null, phoneError: null });
  const [pricingRules, setPricingRules] = useState(store?.pricingRules || [{ minKm: 0, maxKm: 3, price: 500 }]);

  const purchaseId = searchParams.get('purchase_id') || null;

  const [storeData, setStoreData] = useState({
    name: store?.name || '', phone: store?.phone || '', address: store?.address || '',
    country: store?.country || 'CL', city: store?.city || null, coordinates: store?.originCoordinates || null,
  });

  useEffect(() => {
    if (store) setStoreData({ name: store.name || '', phone: store.phone || '', address: store.address || '', country: store.country || 'CL', city: store.city || null, coordinates: store.originCoordinates || null });
  }, [store]);

  useEffect(() => {
    if (store?.pricingRules?.length > 0) setPricingRules(store.pricingRules);
  }, [store?.pricingRules]);

  const handleSuggest = useMemo(() => async address => {
    if (!address?.trim()) { setSuggestions([]); return; }
    setSearchLoading(true);
    try { const bbox = storeData.city?.bbox || null; setSuggestions(await getAddressSuggestions(address, storeData.country?.toLowerCase() || 'cl', bbox)); }
    catch { setSuggestions([]); }
    finally { setSearchLoading(false); }
  }, [storeData.country, storeData.city]);

  const handleStoreSearch = (address, coordinates) => { setStoreData(prev => ({ ...prev, address, coordinates })); setSuggestions([]); };
  const handleCountryChange = country => setStoreData(prev => ({ ...prev, country, city: null }));
  const handleCityChange = city => {
    if (!city) { setStoreData(prev => ({ ...prev, city: null })); return; }
    const bbox = createBBox(city.center.lng, city.center.lat, getOffsetByPopulation(city.population));
    setStoreData(prev => ({ ...prev, city: { name: city.name, center: { lng: city.center.lng, lat: city.center.lat }, bbox, population: city.population } }));
  };

  const handleSaveStore = async () => {
    setLoading(true); setSuccess(''); setError('');
    try {
      if (!storeData.coordinates) { setError('La dirección es requerida'); return; }
      await saveStore({ name: storeData.name, phone: storeData.phone, address: storeData.address, country: storeData.country, city: storeData.city, originCoordinates: storeData.coordinates });
      setSuccess('Local guardado correctamente');
    } catch { setError('Error al guardar'); }
    finally { setLoading(false); }
  };

  const handleAddCourier = async () => { if (!newCourier.name.trim() || !newCourier.phone.trim()) return; await addCourier(newCourier); setNewCourier({ name: '', phone: '' }); };
  const handleEditClick = courier => { setEditingCourierId(courier.id); setEditForm({ name: courier.name, phone: courier.phone }); setEditErrors({ nameError: null, phoneError: null }); };
  const handleCancelEdit = () => { setEditingCourierId(null); setEditForm({ name: '', phone: '' }); setEditErrors({ nameError: null, phoneError: null }); };
  const handleSaveEdit = async () => {
    const nameError = validateCourierName(editForm.name), phoneError = validatePhone(editForm.phone);
    if (nameError || phoneError) { setEditErrors({ nameError, phoneError }); return; }
    await updateCourier(editingCourierId, editForm); setEditingCourierId(null); setEditForm({ name: '', phone: '' }); setEditErrors({ nameError: null, phoneError: null });
  };

  const handleSaveCouriers = async () => {
    setLoading(true); setSuccess(''); setError('');
    try {
      await saveCouriers(couriers);
      setSuccess('Repartidores guardados correctamente');
    } catch { setError('Error al guardar'); }
    finally { setLoading(false); }
  };

  const handleSavePricing = async () => {
    setLoading(true);
    try { await savePricingRules(pricingRules); setSuccess('Tarifas guardadas correctamente'); }
    catch { setError('Error al guardar'); }
    finally { setLoading(false); }
  };

  const handlePricingChange = (index, field, value) => {
    const u = [...pricingRules];
    if (field === 'maxKm') {
      u[index] = { ...u[index], maxKm: value };
      // Cascada: si hay una siguiente regla, su minKm se actualiza automáticamente
      if (index < u.length - 1) {
        u[index + 1] = { ...u[index + 1], minKm: value };
      }
    } else if (field === 'price') {
      u[index] = { ...u[index], price: value };
    }
    setPricingRules(u);
  };
  const handleAddPricingRule = () => {
    const lastRule = pricingRules[pricingRules.length - 1];
    const nextMin = lastRule?.maxKm ?? 0;
    setPricingRules(prev => [...prev, { minKm: nextMin, maxKm: null, price: 0 }]);
  };
  const handleRemovePricingRule = index => {
    setPricingRules(prev => prev.filter((_, i) => i !== index));
  };
  
  const mapCenter = COUNTRY_CENTERS[storeData.country] || COUNTRY_CENTERS.CL;

  if (!store) {
    return (
      <SettingsLayout activeTab={activeTab} onTabChange={setActiveTab}>
        <SettingsSkeleton />
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {success && (
        <div className="mb-4 p-3 bg-gold-bg border border-gold/25 rounded-sm text-gold-dim text-sm">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-gold-bg border border-gold/25 rounded-sm text-gold-dim text-sm">
          {error}
        </div>
      )}
      {activeTab === 'store' && <SettingsTabStore storeData={storeData} suggestions={suggestions} searchLoading={searchLoading} mapCenter={mapCenter} onChange={setStoreData} onCountryChange={handleCountryChange} onCityChange={handleCityChange} onSuggest={handleSuggest} onSearch={handleStoreSearch} onSave={handleSaveStore} loading={loading} />}
      {activeTab === 'couriers' && <SettingsTabCouriers couriers={couriers} newCourier={newCourier} editingCourierId={editingCourierId} editForm={editForm} editErrors={editErrors} onAdd={handleAddCourier} onEditClick={handleEditClick} onCancelEdit={handleCancelEdit} onSaveEdit={handleSaveEdit} onRemove={removeCourier} onNewCourierChange={setNewCourier} onEditFormChange={setEditForm} onSave={handleSaveCouriers} loading={loading} country={store?.country} />}
      {activeTab === 'pricing' && <SettingsTabPricing pricingRules={pricingRules} loading={loading} onChange={handlePricingChange} onAdd={handleAddPricingRule} onSave={handleSavePricing} onRemove={handleRemovePricingRule} />}
      {activeTab === 'calderos' && <CalderosTabContent purchaseId={purchaseId} />}

    </SettingsLayout>
  );
}
