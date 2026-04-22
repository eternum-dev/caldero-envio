import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';
import SettingsLayout from '../templates/SettingsLayout';
import FormField from '../ui/molecules/FormField';
import Button from '../ui/atoms/Button';
import Icon from '../ui/atoms/Icon';
import Badge from '../ui/atoms/Badge';

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { store, couriers, saveStore, addCourier, removeCourier, savePricingRules } = useStore();
  const [activeTab, setActiveTab] = useState('store');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const [storeData, setStoreData] = useState({
    name: store?.name || '',
    phone: store?.phone || '',
    address: store?.address || '',
    lat: store?.originCoordinates?.lat || '',
    lng: store?.originCoordinates?.lng || '',
  });

  const [newCourier, setNewCourier] = useState({ name: '', phone: '' });
  const [pricingRules, setPricingRules] = useState(
    store?.pricingRules || [{ minKm: 0, maxKm: 3, price: 500 }]
  );

  const handleSaveStore = async () => {
    setLoading(true);
    setSuccess('');
    try {
      await saveStore({
        name: storeData.name,
        phone: storeData.phone,
        address: storeData.address,
        originCoordinates: { lat: parseFloat(storeData.lat), lng: parseFloat(storeData.lng) },
      });
      setSuccess('Local guardado correctamente');
    } catch (err) {
      setSuccess('Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourier = async () => {
    if (!newCourier.name.trim() || !newCourier.phone.trim()) return;
    await addCourier(newCourier);
    setNewCourier({ name: '', phone: '' });
  };

  const handleSavePricing = async () => {
    setLoading(true);
    try {
      await savePricingRules(pricingRules);
      setSuccess('Tarifas guardadas correctamente');
    } catch (err) {
      setSuccess('Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const handlePricingChange = (index, field, value) => {
    const updated = [...pricingRules];
    updated[index] = { ...updated[index], [field]: value };
    setPricingRules(updated);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <SettingsLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {success && (
        <div className="mb-4 p-3 bg-surface-container_low rounded-md text-secondary text-sm">
          {success}
        </div>
      )}

      {activeTab === 'store' && (
        <div className="bg-surface-container rounded-md p-6">
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

            <FormField
              label="Dirección"
              value={storeData.address}
              onChange={e => setStoreData({ ...storeData, address: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Latitud"
                type="number"
                step="any"
                value={storeData.lat}
                onChange={e => setStoreData({ ...storeData, lat: e.target.value })}
              />
              <FormField
                label="Longitud"
                type="number"
                step="any"
                value={storeData.lng}
                onChange={e => setStoreData({ ...storeData, lng: e.target.value })}
              />
            </div>

            <Button variant="primary" onClick={handleSaveStore} loading={loading}>
              Guardar Cambios
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'couriers' && (
        <div className="bg-surface-container rounded-md p-6">
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
                className="flex items-center justify-between p-4 bg-surface-container_low rounded-md"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="primary">{courier.name.charAt(0)}</Badge>
                  <div>
                    <p className="font-medium text-on_surface">{courier.name}</p>
                    <p className="text-sm text-on-surface-variant">{courier.phone}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeCourier(courier.id)}>
                  <Icon name="x" className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'pricing' && (
        <div className="bg-surface-container rounded-md p-6">
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

          <Button variant="primary" onClick={handleSavePricing} loading={loading} className="mt-6">
            Guardar Tarifas
          </Button>
        </div>
      )}

      <div className="mt-8 pt-8 border-t border-surface-container_low">
        <p className="text-sm text-on-surface-variant mb-2">Usuario: {user?.email}</p>
        <Button variant="tertiary" onClick={handleSignOut}>
          Cerrar Sesión
        </Button>
      </div>
    </SettingsLayout>
  );
}
