import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import Button from '../ui/atoms/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg bg-page-warm flex flex-col justify-center items-center px-4">
      <div className="text-center">
        <h1 className="font-display text-display-lg font-semibold text-gold">404</h1>
        <h2 className="font-display text-display-sm font-semibold text-ink mt-4">Página no encontrada</h2>
        <p className="font-sans text-sm text-muted mt-2 mb-8">Lo que buscas no existe o fue movido.</p>
        <Link to={ROUTES.LANDING}>
          <Button variant="primary" size="lg">
            Volver al inicio
          </Button>
        </Link>
      </div>
    </div>
  );
}
