import { useState, useCallback, useMemo, useEffect } from 'react';
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
import { getAddressSuggestions } from '../services/mapService';
import { getPrintContent } from '../services/deliveryService';
import { generateWhatsAppLink, prepareRouteMessage } from '../services/whatsappService';
import Button from '../ui/atoms/Button';
import { SANTIAGO_CENTER } from '../config/constants';

export default function App() {
  const { store, couriers } = useStore();
  const { delivery, loading, error, setAddress, setCourier, searchAddress, calculate, reset } =
    useDeliveryCalculator();

  const [showResults, setShowResults] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    reset();
  }, []);

  const countryCode = store?.country?.toLowerCase() || 'cl';
  const cityBbox = store?.city?.bbox || null;

  const handleSearch = useCallback(async (address, coordinates) => {
    setShowResults(false);
    setSuggestions([]);
    if (coordinates) {
      setAddress(address, coordinates);
    } else {
      await searchAddress(address);
    }
  }, [setAddress, searchAddress]);

  const handleSuggest = useMemo(() => {
    return async address => {
      if (!address || !address.trim()) {
        setSuggestions([]);
        return;
      }
      const results = await getAddressSuggestions(address, countryCode, cityBbox);
      setSuggestions(results);
    };
  }, [countryCode, cityBbox]);

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
    const content = getPrintContent({
      storeName: store?.name || 'Mi Local',
      address: delivery.address,
      price: delivery.price,
      distance: delivery.distance,
      time: delivery.time,
      courierName: courier?.name,
    });

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
        <div className="bg-surface-medium rounded-md p-6">
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
                onSuggest={handleSuggest}
                suggestions={suggestions}
                debounceMs={500}
                loading={loading}
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
              <DistanceInfo distance={delivery.distance} time={delivery.time} totalTime={delivery.time ? delivery.time * 2 + 10 : null} />
              <ActionButtons onWhatsApp={handleWhatsApp} onPrint={handlePrint} onReset={reset} />
            </div>
          )}
        </div>

        <div className="bg-surface-medium rounded-md p-6">
          <h2 className="text-xl font-semibold text-on_surface mb-6">Mapa</h2>
          <MapPreview
            origin={store?.originCoordinates || SANTIAGO_CENTER}
            destination={delivery.coordinates}
            routeGeometry={delivery.routeGeometry}
            routeCalculated={showResults}
            className="w-full"
            style={{ height: '400px' }}
          />
        </div>
      </div>
    </AppLayout>
  );
}
