import { Header, HeaderLogo } from '../ui/Header';
import SEO from '../ui/atoms/SEO';
import { ROUTES } from '../utils/constants';

export default function MobileCalculator() {
  return (
    <div className="min-h-screen bg-bg bg-page-warm">
      <SEO
        title="¿Cuánto cobrar por tu envío? — Caldero Envío"
        description="Calculá gratis cuánto deberías cobrar por tus envíos. Considera combustible y desgaste del vehículo. Sin registro."
        canonical={ROUTES.TOOLS_MOBILE}
        schema={{
          '@type': 'WebApplication',
          name: 'Calculadora de Móvil — Caldero Envío',
          description: 'Calculá gratis cuánto deberías cobrar por tus envíos.',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
        }}
      />
      <Header>
        <HeaderLogo to={ROUTES.LANDING} />
      </Header>

      <main className="flex-1 w-full max-w-md mx-auto px-4 py-8">
        <h1 className="font-display text-display-sm font-semibold text-ink mb-4">
          Calculadora de Móvil
        </h1>
      </main>

      <footer className="text-center py-8 font-sans text-xs text-muted">
        © 2026 Caldero Envío. Todos los derechos reservados.
      </footer>
    </div>
  );
}
