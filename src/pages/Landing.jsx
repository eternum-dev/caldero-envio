import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import { Header, HeaderLogo, HeaderActions } from '../ui/Header';
import Button from '../ui/atoms/Button';
import FeatureCard from '../ui/molecules/FeatureCard';
import Mascot from '../ui/atoms/Mascot';
import VideoPlayer from '../ui/atoms/VideoPlayer';
import SEO from '../ui/atoms/SEO';

const features = [
  {
    icon: 'map',
    title: 'Rápido',
    description: 'Cálculo en menos de 30 segundos. El cajero solo ingresa la dirección.',
  },
  {
    icon: 'check',
    title: 'Consistente',
    description: 'Precios basados en reglas claras. Sin depender de quién atienda.',
  },
  {
    icon: 'whatsapp',
    title: 'WhatsApp',
    description: 'Envío automático de datos al repartidor con un clic.',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg bg-page-warm">
      <SEO
        title="Caldero Envío — Calcula envíos en segundos"
        canonical="/"
        schema={{
          '@type': 'SoftwareApplication',
          name: 'Caldero Envío',
          operatingSystem: 'Web',
          applicationCategory: 'BusinessApplication',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
        }}
      />
      <Header>
        <Link to={ROUTES.LANDING}>
          <Mascot className="w-8 h-8" />
        </Link>
        <HeaderActions>
          <Link to={ROUTES.LOGIN}>
            <Button variant="ghost">Iniciar Sesión</Button>
          </Link>
          <Link to={ROUTES.REGISTER}>
            <Button variant="primary">Registrarse</Button>
          </Link>
        </HeaderActions>
      </Header>

      <main>
        <section className="max-w-7xl mx-auto px-4 py-20 text-center">
          <Mascot className="w-40 h-40 mx-auto mb-6" />
          <span className="inline-block font-sans text-xs uppercase tracking-widest text-gold-dim mb-4">
            Para tu negocio
          </span>
          <h1 className="font-display text-display-lg font-semibold text-ink mb-6">
            Cálculo de envíos{' '}
            <span className="italic text-gold">en menos de 30 segundos</span>
          </h1>
          <p className="font-sans text-sm text-muted max-w-xl mx-auto mb-8">
            Olvídate de calcular precios manualmente. Precios consistentes, sin errores, con envío
            automático por WhatsApp.
          </p>
          <Link to={ROUTES.REGISTER}>
            <Button variant="primary" size="lg">
              Comenzar gratis
            </Button>
          </Link>
        </section>

        <section className="max-w-4xl mx-auto px-4 mb-16">
          <div className="bg-surface border border-gold/18 rounded-sm overflow-hidden">
            <VideoPlayer
              className="w-full aspect-video"
              fallback={
                <div className="w-full aspect-video bg-surface border border-gold/18 flex flex-col items-center justify-center gap-3 p-8">
                  <Mascot className="w-24 h-24 opacity-40" />
                  <p className="font-sans text-xs text-muted">Video demo próximamente</p>
                </div>
              }
            />
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <FeatureCard
              key={feature.icon}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </section>
      </main>

      <footer className="text-center py-8 font-sans text-xs text-muted">
        © 2026 Caldero Envío. Todos los derechos reservados.
      </footer>
    </div>
  );
}
