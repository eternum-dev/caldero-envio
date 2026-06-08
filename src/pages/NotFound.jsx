import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import Button from '../ui/atoms/Button';
import Mascot from '../ui/atoms/Mascot';
import SEO from '../ui/atoms/SEO';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg bg-page-warm flex flex-col justify-center items-center px-4">
      <SEO
        title="404 — Página no encontrada — Caldero Envío"
        description="La página que buscas no existe."
        noindex
      />
      <div className="text-center">
        <Mascot className="w-48 h-48 mx-auto mb-6 opacity-60" />
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
