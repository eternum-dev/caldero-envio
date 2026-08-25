import { useState, useMemo } from 'react';
import { Header, HeaderLogo } from '../ui/Header';
import FormField from '../ui/molecules/FormField';
import SEO from '../ui/atoms/SEO';
import { calculateMobileCost, prepareMobileCostMessage, openWhatsAppShare } from '../services/mobileCalculatorService';
import Button from '../ui/atoms/Button';
import Icon from '../ui/atoms/Icon';
import { ROUTES } from '../utils/constants';

const INITIAL_INPUTS = {
  distance: '',
  kmPerLiter: '',
  pricePerLiter: '',
  wearCostPerKm: '',
};

export default function MobileCalculator() {
  const [inputs, setInputs] = useState(INITIAL_INPUTS);

  const handleChange = (field) => (event) => {
    setInputs((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const formatter = useMemo(() => new Intl.NumberFormat('es-AR'), []);

  const result = useMemo(() => {
    const parsed = {
      distance: parseFloat(inputs.distance),
      kmPerLiter: parseFloat(inputs.kmPerLiter),
      pricePerLiter: parseFloat(inputs.pricePerLiter),
      wearCostPerKm: parseFloat(inputs.wearCostPerKm),
    };

    const isValid = Object.values(parsed).every(
      (value) => Number.isFinite(value) && value > 0
    );

    if (!isValid) {
      return null;
    }

    try {
      return calculateMobileCost(parsed);
    } catch {
      return null;
    }
  }, [inputs]);

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
        <h1 className="font-display text-display-sm font-semibold text-ink mb-2">
          ¿Cuánto cobrar por tu envío?
        </h1>
        <p className="font-sans text-sm text-muted mb-2">
          Calculá el costo estimado de combustible y desgaste para tus envíos.
        </p>
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={() =>
              setInputs({
                distance: '4.5',
                kmPerLiter: '12',
                pricePerLiter: '1200',
                wearCostPerKm: '80',
              })
            }
            className="text-sm text-gold-dim hover:text-gold underline underline-offset-2"
          >
            Probar con valores de ejemplo
          </button>
        </div>

        <section className="bg-surface-2 rounded-md p-5 mb-6 border border-gold/18">
          <h2 className="font-display text-lg font-semibold text-ink mb-3">
            ¿Cuándo te sirve?
          </h2>
          <p className="font-sans text-sm text-muted mb-3">
            ¿Hacés envíos por tu cuenta? Esta calculadora te ayuda a estimar el costo real
            de cada viaje — combustible + desgaste del vehículo — para que sepas qué precio ponerle.
          </p>
          <ul className="space-y-2 text-sm text-muted">
            <li className="flex gap-2">
              <Icon name="check" className="w-4 h-4 text-gold-dim shrink-0 mt-0.5" />
              <span>Querés saber si te conviene aceptar un envío que te ofrecen</span>
            </li>
            <li className="flex gap-2">
              <Icon name="check" className="w-4 h-4 text-gold-dim shrink-0 mt-0.5" />
              <span>Necesitás fijar un precio justo para tus clientes</span>
            </li>
            <li className="flex gap-2">
              <Icon name="check" className="w-4 h-4 text-gold-dim shrink-0 mt-0.5" />
              <span>Querés entender qué parte del cobro es combustible y qué parte es desgaste</span>
            </li>
          </ul>
          <p className="font-sans text-xs text-muted mt-3 italic">
            Solo necesitás 4 datos que ya conocés de tu vehículo.
          </p>
        </section>

        <form className="flex flex-col gap-4">
          <FormField
            label="Distancia (km)"
            icon="map"
            type="number"
            step="0.1"
            min="0"
            placeholder="ej: 4.5"
            value={inputs.distance}
            onChange={handleChange('distance')}
            required
          />
          <FormField
            label="Consumo de tu vehículo (km/L)"
            icon="fuel"
            type="number"
            step="0.1"
            min="0"
            placeholder="ej: 12"
            value={inputs.kmPerLiter}
            onChange={handleChange('kmPerLiter')}
            required
          />
          <FormField
            label="Precio del combustible ($/L)"
            icon="coin"
            type="number"
            step="0.01"
            min="0"
            placeholder="ej: 1200"
            value={inputs.pricePerLiter}
            onChange={handleChange('pricePerLiter')}
            required
          />
          <FormField
            label="Costo de uso por km ($/km)"
            icon="wrench"
            type="number"
            step="0.01"
            min="0"
            placeholder="ej: 80"
            value={inputs.wearCostPerKm}
            onChange={handleChange('wearCostPerKm')}
            required
          />
          <p className="font-sans text-xs text-muted -mt-2">
            Incluye neumáticos, aceite y amortización del vehículo.
          </p>
        </form>

        {result && (
          <div className="mt-6 bg-surface border border-gold/18 rounded-sm p-5">
            <div className="flex justify-between font-sans text-sm text-muted mb-2">
              <span>Combustible</span>
              <span className="text-ink">${formatter.format(result.fuelCost)}</span>
            </div>
            <div className="flex justify-between font-sans text-sm text-muted mb-3">
              <span>Desgaste</span>
              <span className="text-ink">${formatter.format(result.wearCost)}</span>
            </div>
            <hr className="border-gold/18 mb-3" />
            <div className="flex justify-between items-baseline">
              <span className="font-sans text-sm font-medium text-ink">Total sugerido</span>
              <span className="font-display text-2xl font-semibold text-gold">
                ${formatter.format(result.total)}
              </span>
            </div>
          </div>
        )}

        {result && (
          <Button
            variant="primary"
            size="lg"
            className="w-full mt-4 min-h-[44px]"
            onClick={() => openWhatsAppShare(prepareMobileCostMessage(result))}
          >
            <Icon name="whatsapp" className="w-5 h-5 mr-2" />
            Enviar por WhatsApp
          </Button>
        )}
      </main>

      <footer className="text-center py-8 font-sans text-xs text-muted">
        © 2026 Caldero Envío. Todos los derechos reservados.
      </footer>
    </div>
  );
}
