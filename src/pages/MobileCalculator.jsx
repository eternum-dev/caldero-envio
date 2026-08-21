import { useState, useMemo } from 'react';
import { Header, HeaderLogo } from '../ui/Header';
import FormField from '../ui/molecules/FormField';
import SEO from '../ui/atoms/SEO';
import { calculateMobileCost } from '../services/mobileCalculatorService';
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
        <p className="font-sans text-sm text-muted mb-6">
          Calculá el costo estimado de combustible y desgaste para tus envíos.
        </p>

        <form className="flex flex-col gap-4">
          <FormField
            label="Distancia (km)"
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
      </main>

      <footer className="text-center py-8 font-sans text-xs text-muted">
        © 2026 Caldero Envío. Todos los derechos reservados.
      </footer>
    </div>
  );
}
