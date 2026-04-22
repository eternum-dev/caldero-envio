import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';

export default function Landing() {
  return (
    <div className="min-h-screen bg-surface-gradient">
      <header className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-secondary">Caldero Envío</h1>
        <div className="flex gap-4">
          <Link to={ROUTES.LOGIN}>
            <Button variant="ghost">Iniciar Sesión</Button>
          </Link>
          <Link to={ROUTES.REGISTER}>
            <Button variant="primary">Registrarse</Button>
          </Link>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold text-on_surface mb-6 text-display">
          Cálculo de envíos en menos de 30 segundos
        </h2>
        <p className="text-xl text-on-surface-variant mb-8">
          Olvídate de calcular precios manualmente. Precios consistentes, sin errores, con envío
          automático por WhatsApp.
        </p>
        <Link to={ROUTES.REGISTER}>
          <Button variant="primary" size="xl">
            Comenzar gratis
          </Button>
        </Link>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container rounded-md p-6">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
            <Icon name="map" className="w-6 h-6 text-secondary" />
          </div>
          <h3 className="text-lg font-semibold text-on_surface mb-2">Rápido</h3>
          <p className="text-on-surface-variant">
            Cálculo en menos de 30 segundos. El cajero solo ingresa la dirección.
          </p>
        </div>

        <div className="bg-surface-container rounded-md p-6">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
            <Icon name="check" className="w-6 h-6 text-secondary" />
          </div>
          <h3 className="text-lg font-semibold text-on_surface mb-2">Consistente</h3>
          <p className="text-on-surface-variant">
            Precios basados en reglas claras. Sin depende de quién atienda.
          </p>
        </div>

        <div className="bg-surface-container rounded-md p-6">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
            <Icon name="whatsapp" className="w-6 h-6 text-secondary" />
          </div>
          <h3 className="text-lg font-semibold text-on_surface mb-2">WhatsApp</h3>
          <p className="text-on-surface-variant">
            Envío automático de datos al repartidor con un clic.
          </p>
        </div>
      </section>

      <footer className="text-center py-8 text-on-surface-variant text-sm">
        © 2026 Caldero Envío. Todos los derechos reservados.
      </footer>
    </div>
  );
}
