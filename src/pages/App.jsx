import { useState } from 'react';
import { useStore } from '../contexts/StoreContext';
import AppLayout from '../ui/templates/AppLayout';
import SearchBox from '../ui/molecules/SearchBox';
import CourierSelect from '../ui/molecules/CourierSelect';
import PriceTag from '../ui/molecules/PriceTag';
import DistanceInfo from '../ui/molecules/DistanceInfo';
import ActionButtons from '../ui/molecules/ActionButtons';
import MapPreview from '../ui/molecules/MapPreview';
import Spinner from '../ui/atoms/Spinner';
import { useDeliveryCalculator } from '../hooks/useDeliveryCalculator';
import { generateWhatsAppLink, prepareRouteMessage } from '../services/whatsappService';
import Button from '../ui/atoms/Button';

export default function App() {
  const { store, couriers } = useStore();
  const { delivery, loading, error, setAddress, setCourier, searchAddress, calculate, reset } =
    useDeliveryCalculator();

  const [showResults, setShowResults] = useState(false);

  const handleSearch = async address => {
    setAddress(address);
    searchAddress(address);
    setShowResults(false);
  };

  const handleCalculate = async () => {
    if (!delivery.courierId) {
      alert('Selecciona un repartidor');
      return;
    }
    await calculate();
    setShowResults(true);
  };

  const handleWhatsApp = () => {
    if (!delivery.price) return;

    const courier = couriers.find(c => c.id === delivery.courierId);
    const message = prepareRouteMessage({
      storeName: store?.name || 'Mi Local',
      address: delivery.address,
      price: delivery.price,
      distance: delivery.distance,
      time: delivery.time,
      courierName: courier?.name,
      mapUrl: delivery.routeUrl,
    });

    const link = generateWhatsAppLink(courier?.phone || '', message);
    window.open(link, '_blank');
  };

  const handlePrint = () => {
    const courier = couriers.find(c => c.id === delivery.courierId);
    const content = `
      <div style="font-family: monospace; padding: 20px; max-width: 300px; margin: 0 auto; background: #121110; color: #e6e1df;">
        <h2 style="text-align: center; color: #FFBF00;">${store?.name || 'Mi Local'}</h2>
        <hr style="border: none; border-top: 1px solid #363433; margin: 10px 0;">
        <p><strong>Dirección:</strong> ${delivery.address}</p>
        <p><strong>Distancia:</strong> ${delivery.distance?.toFixed(1)} km</p>
        <p><strong>Tiempo:</strong> ${Math.round(delivery.time)} min</p>
        <p><strong>Repartidor:</strong> ${courier?.name || 'No asignado'}</p>
        <hr style="border: none; border-top: 1px solid #363433; margin: 10px 0;">
        <h1 style="text-align: center; font-size: 24px; color: #FFBF00;">$${delivery.price}</h1>
        <hr style="border: none; border-top: 1px solid #363433; margin: 10px 0;">
        <p style="text-align: center; font-size: 12px; color: #d4c3ba;">Caldero Envío</p>
      </div>
    `;

    const printWindow = window.open('', '', 'width=400,height=600');
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  if (!store) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-on-surface-variant">Cargando configuración...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-container rounded-md p-6">
          <h2 className="text-xl font-semibold text-on_surface mb-6">Calcular Envío</h2>

          {error && (
            <div className="mb-4 p-3 bg-error-container rounded-md text-secondary text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-label text-sm text-on-surface-variant mb-2 tracking-label">
                Dirección de destino
              </label>
              <SearchBox
                placeholder="Ingresá la dirección..."
                onSearch={handleSearch}
                debounceMs={500}
              />
            </div>

            <CourierSelect couriers={couriers} value={delivery.courierId} onChange={setCourier} />

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleCalculate}
              disabled={!delivery.address || !delivery.courierId || loading}
              loading={loading}
            >
              {loading ? 'Calculando...' : 'Calcular Envío'}
            </Button>
          </div>

          {showResults && delivery.price && (
            <div className="mt-6 space-y-4">
              <PriceTag value={delivery.price} label="Precio del envío" />
              <DistanceInfo distance={delivery.distance} time={delivery.time} />
              <ActionButtons onWhatsApp={handleWhatsApp} onPrint={handlePrint} onReset={reset} />
            </div>
          )}
        </div>

        <div className="bg-surface-container rounded-md p-6">
          <h2 className="text-xl font-semibold text-on_surface mb-6">Mapa</h2>
          <MapPreview src={delivery.mapImage} className="w-full" style={{ minHeight: '400px' }} />
        </div>
      </div>
    </AppLayout>
  );
}
