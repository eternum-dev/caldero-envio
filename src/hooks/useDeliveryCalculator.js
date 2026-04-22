import { useState, useCallback } from 'react';
import { geocodeAddress, getDistance, getStaticMapUrl } from '../services/mapService';
import { calculatePrice } from '../services/deliveryService';
import { useStore } from '../contexts/StoreContext';
import { useDelivery } from '../contexts/DeliveryContext';

export function useDeliveryCalculator() {
  const { store } = useStore();
  const { delivery, setAddress, setCourier, setResult, reset } = useDelivery();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchAddress = useCallback(
    async addressText => {
      if (!addressText.trim()) return;

      setLoading(true);
      setError(null);

      try {
        const { coordinates } = await geocodeAddress(addressText);
        setAddress(addressText, coordinates);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [setAddress]
  );

  const calculate = useCallback(async () => {
    if (!delivery.coordinates || !delivery.courierId || !store) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { distance, time } = await getDistance(store.originCoordinates, delivery.coordinates);

      const price = calculatePrice(distance, store.pricingRules);
      const mapUrl = getStaticMapUrl(store.originCoordinates, delivery.coordinates);

      setResult({
        distance,
        time,
        price,
        routeUrl: mapUrl,
        mapImage: mapUrl,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [delivery.coordinates, delivery.courierId, store, setResult]);

  return {
    delivery,
    loading,
    error,
    setAddress: address => setAddress(address),
    setCourier,
    searchAddress,
    calculate,
    reset,
  };
}
