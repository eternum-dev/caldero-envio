import { createContext, useContext, useState } from 'react';

const DeliveryContext = createContext();

export function useDelivery() {
  return useContext(DeliveryContext);
}

export function DeliveryProvider({ children }) {
  const [delivery, setDelivery] = useState({
    address: '',
    coordinates: null,
    courierId: '',
    distance: null,
    time: null,
    price: null,
    routeUrl: null,
    mapImage: null,
    routeGeometry: null,
  });

  const setAddress = (address, coordinates = null) => {
    setDelivery(prev => ({
      ...prev,
      address,
      coordinates,
      distance: null,
      time: null,
      price: null,
      routeUrl: null,
      mapImage: null,
    }));
  };

  const setCourier = courierId => {
    setDelivery(prev => ({ ...prev, courierId }));
  };

  const setResult = ({ distance, time, price, routeUrl, mapImage, routeGeometry }) => {
    setDelivery(prev => ({
      ...prev,
      distance,
      time,
      price,
      routeUrl,
      mapImage,
      routeGeometry,
    }));
  };

  const reset = () => {
    setDelivery({
      address: '',
      coordinates: null,
      courierId: '',
      distance: null,
      time: null,
      price: null,
      routeUrl: null,
      mapImage: null,
      routeGeometry: null,
    });
  };

  const value = {
    delivery,
    setAddress,
    setCourier,
    setResult,
    reset,
  };

  return <DeliveryContext.Provider value={value}>{children}</DeliveryContext.Provider>;
}
