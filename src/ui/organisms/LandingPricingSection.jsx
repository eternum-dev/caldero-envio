import Button from '../atoms/Button';
import PackageCardGrid from '../molecules/PackageCardGrid';
import { PACKAGES } from '../../utils/constants';

/**
 * Public pricing section for the landing page.
 *
 * @param {{ isAuthenticated: boolean, onCTAClick: () => void }} props
 */
export default function LandingPricingSection({ isAuthenticated, onCTAClick }) {
  const ctaText = isAuthenticated ? 'Ir a la app' : 'Crear cuenta gratis';

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <h2 className="font-display text-display-md font-semibold text-ink mb-4">
          Modelo de prepago. Cargas calderos según tu demanda, sin compromiso de permanencia.
        </h2>
        <p className="font-sans text-sm text-muted max-w-xl mx-auto">
          Empieza a usar Caldero Envío sin costo. Te regalamos 10 calderos al registrarte.
        </p>
      </div>

      <PackageCardGrid
        packages={Object.values(PACKAGES)}
        disabled
        className="mb-8"
      />

      <div className="flex justify-center">
        <Button variant="primary" size="lg" onClick={onCTAClick}>
          {ctaText}
        </Button>
      </div>
    </section>
  );
}
