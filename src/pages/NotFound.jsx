import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import Button from '../ui/atoms/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center py-12 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-surface-container_high">404</h1>
        <h2 className="text-2xl font-bold text-on_surface mt-4">Página no encontrada</h2>
        <p className="text-on-surface-variant mt-2 mb-8">Lo que buscas no existe o fue movido.</p>
        <Link to={ROUTES.LANDING}>
          <Button variant="primary" size="lg">
            Volver al inicio
          </Button>
        </Link>
      </div>
    </div>
  );
}
