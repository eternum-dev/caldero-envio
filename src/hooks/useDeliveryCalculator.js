import { useState, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { geocodeAddress, getDistance, generateGoogleMapsLink, decodePolyline } from '../services/mapService';
import { calculatePrice } from '../services/deliveryService';
import { spendCaldero } from '../services/calderoService';
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
      // Server-side debit BEFORE the actual route computation.
      // The backend (spendCaldero) atomically decrements creditsBalance
      // by 1 and records a 'deduction' transaction. If the user has
      // zero calderos, the CF throws `failed-precondition` and we
      // short-circuit before spending Mapbox quota on a no-go call.
      //
      // idempotencyKey is fresh per attempt; if this call (or any
      // retry of it) succeeds once, the backend will return the same
      // transaction on duplicate submissions instead of double-charging.
      const idempotencyKey = nanoid(12);
      await spendCaldero(idempotencyKey);

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
      // Surface backend error codes in a user-friendly way. The most
      // important case is "failed-precondition" (no calderos) — give
      // the user a clear CTA instead of a raw error message.
      if (err?.code === 'failed-precondition') {
        setError('No te quedan calderos. Comprá más para seguir calculando.');
      } else if (err?.code === 'not-found') {
        setError('Tu cuenta no está lista todavía. Recargá la página.');
      } else {
        setError(err.message || 'No se pudo calcular la ruta. Intenta de nuevo.');
      }
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
