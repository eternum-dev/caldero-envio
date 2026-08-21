import { useState } from 'react';
import { Header, HeaderLogo } from '../ui/Header';
import FormField from '../ui/molecules/FormField';
import SEO from '../ui/atoms/SEO';
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
      </main>

      <footer className="text-center py-8 font-sans text-xs text-muted">
        © 2026 Caldero Envío. Todos los derechos reservados.
      </footer>
    </div>
  );
}
