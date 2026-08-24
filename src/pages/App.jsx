import { useState, useCallback, useMemo, useEffect } from 'react';
import { useStore } from '../contexts/StoreContext';
import AppLayout from '../ui/templates/AppLayout';
import SearchBox from '../ui/molecules/SearchBox';
import CourierSelect from '../ui/molecules/CourierSelect';
import PriceTag from '../ui/molecules/PriceTag';
import DistanceInfo from '../ui/molecules/DistanceInfo';
import ActionButtons from '../ui/molecules/ActionButtons';
import MapPreview from '../ui/molecules/MapPreview';
import { useDeliveryCalculator } from '../hooks/useDeliveryCalculator';
import AppSkeleton from '../ui/molecules/AppSkeleton';
import { getAddressSuggestions } from '../services/mapService';
import { getPrintContent } from '../services/deliveryService';
import { generateWhatsAppLink, prepareRouteMessage } from '../services/whatsappService';
import Button from '../ui/atoms/Button';
import { SANTIAGO_CENTER } from '../config/constants';

export default function App() {
  const { store, couriers, loading: storeLoading } = useStore();
  const { delivery, loading, error, setAddress, setCourier, searchAddress, calculate, reset } =
    useDeliveryCalculator();

  const [showResults, setShowResults] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    reset();
  }, []);

  const countryCode = store?.country?.toLowerCase() || 'cl';
  const cityBbox = store?.city?.bbox || null;

  const handleSearch = useCallback(
    async (address, coordinates) => {
      setShowResults(false);
      setSuggestions([]);
      if (coordinates) {
        setAddress(address, coordinates);
      } else {
        await searchAddress(address);
      }
    },
    [setAddress, searchAddress]
  );

  const handleSuggest = useMemo(() => {
    return async address => {
      console.log('handleSuggest called with:', address);
      if (!address || !address.trim()) {
        setSuggestions([]);
        return;
      }
      try {
        console.log('calling getAddressSuggestions...');
        const results = await getAddressSuggestions(address, countryCode, cityBbox);
        console.log('getAddressSuggestions returned:', results);
        setSuggestions(results);
      } catch (err) {
        console.error('Suggestions error:', err);
        setSuggestions([]);
      }
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

  if (storeLoading) {
    return (
      <AppLayout>
        <AppSkeleton />
      </AppLayout>
    );
  }

  if (!store) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <h2 className="font-display text-2xl font-semibold text-ink">
            Aún no configuraste tu local
          </h2>
          <p className="font-sans text-sm text-muted max-w-md">
            Para empezar a calcular envíos, completá el paso de onboarding
            con los datos de tu tienda (nombre, dirección y ciudad).
          </p>
          <a
            href="/onboarding"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold text-bg font-sans text-sm font-semibold rounded-sm hover:bg-gold-bright transition-colors"
          >
            Ir a onboarding
          </a>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:min-h-[calc(100vh-104px)]">
        {/* Left panel — form */}
        <div className="lg:border-r lg:pr-7 pb-7 lg:pb-0 border-b lg:border-b-0 border-gold/18 grid grid-cols-1 gap-10 content-start">
          <h1 className="font-display text-4xl font-semibold text-ink">
            Calcular Envío
          </h1>

          {error && (
            <div className="p-3 bg-gold-bg border border-gold/25 rounded-sm text-gold-dim text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div>
              <label className="block font-sans text-label uppercase tracking-widest text-muted mb-1.5">
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
              className="w-full"
              onClick={handleCalculate}
              disabled={!delivery.address || !delivery.courierId || loading}
              loading={loading}
            >
              {loading ? 'Calculando...' : 'Calcular Envío'}
            </Button>
          </div>
          
          {!showResults && (
            <div className="font-sans text-sm text-muted text-center py-8 border border-dashed border-gold/18 rounded-sm">
              Completá los datos y calculá un envío para ver los resultados aquí
            </div>
          )}
          {showResults && delivery.price && (
            <div className="mt-6 flex flex-col gap-4 animate-slide-up">
              <PriceTag value={delivery.price} label="Precio del envío" />
              <DistanceInfo
                distance={delivery.distance}
                time={delivery.time}
                totalTime={delivery.time ? delivery.time * 2 + 10 : null}
              />
              <ActionButtons onWhatsApp={handleWhatsApp} onPrint={handlePrint} onReset={reset} />
            </div>
          )}
        </div>

        {/* Right panel — map */}
        <div className="lg:flex lg:flex-col pl-0 lg:pl-7 pt-7 lg:pt-0 pb-4">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-display text-2xl font-semibold text-ink">Ruta</h2>
            {store?.city?.name && (
              <span className="bg-gold-bg border border-gold/25 text-gold-dim text-[10px] px-2 py-0.5 rounded-full font-sans">
                {store.city.name}
              </span>
            )}
          </div>
          <MapPreview
            origin={store?.originCoordinates || SANTIAGO_CENTER}
            destination={delivery.coordinates}
            routeGeometry={delivery.routeGeometry}
            routeCalculated={showResults}
            className="w-full flex-1"
          />
        </div>
      </div>
    </AppLayout>
  );
}
