import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { StoreProvider } from './contexts/StoreContext';
import { DeliveryProvider } from './contexts/DeliveryContext';
import AppRouter from './router/AppRouter';

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <StoreProvider>
            <DeliveryProvider>
              <AppRouter />
            </DeliveryProvider>
          </StoreProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}
