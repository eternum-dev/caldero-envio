import { useState, useCallback } from 'react';
import { geocodeAddress, getDistance, generateGoogleMapsLink, decodePolyline } from '../services/mapService';
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
        const country = store?.country?.toLowerCase() || 'cl';
        const { coordinates } = await geocodeAddress(addressText, country);
        setAddress(addressText, coordinates);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [setAddress, store]
  );

  const calculate = useCallback(async () => {
    if (!delivery.coordinates || !delivery.courierId || !store) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { distance, time, geometry } = await getDistance(store.originCoordinates, delivery.coordinates);

      const price = calculatePrice(distance, store.pricingRules);
      const googleMapsUrl = generateGoogleMapsLink(store.originCoordinates, delivery.coordinates);
      const routeCoords = decodePolyline(geometry);
      const routeGeometry = routeCoords.length > 0 ? {
        type: 'LineString',
        coordinates: routeCoords
      } : null;

      setResult({
        distance,
        time,
        price,
        routeUrl: googleMapsUrl,
        mapImage: googleMapsUrl,
        routeGeometry: routeGeometry,
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
    setAddress: (address, coordinates) => setAddress(address, coordinates),
    setCourier,
    searchAddress,
    calculate,
    reset,
  };
}
