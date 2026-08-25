import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Header, HeaderLogo, HeaderNav, HeaderActions, HeaderUserMenu } from '../ui/Header';
import FormField from '../ui/molecules/FormField';
import MobileCalculatorValueProp from '../ui/organisms/MobileCalculatorValueProp';
import MobileCalculatorResult from '../ui/organisms/MobileCalculatorResult';
import MobileCalculatorTrustLine from '../ui/molecules/MobileCalculatorTrustLine';
import SEO from '../ui/atoms/SEO';
import { calculateMobileCost, prepareMobileCostMessage, openWhatsAppShare } from '../services/mobileCalculatorService';
import Button from '../ui/atoms/Button';
import Icon from '../ui/atoms/Icon';
import { ROUTES } from '../utils/constants';
import { useAuth } from '../contexts/AuthContext';

const INITIAL_INPUTS = {
  distance: '',
  kmPerLiter: '',
  pricePerLiter: '',
  wearCostPerKm: '',
  marginPercent: '25',
  includeReturn: true,
};

export default function MobileCalculator() {
  const [inputs, setInputs] = useState(INITIAL_INPUTS);
  const { user } = useAuth();

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
      marginPercent: parseFloat(inputs.marginPercent),
      includeReturn: inputs.includeReturn,
    };

    // Cost fields must be positive; margin just needs to be a finite number
    // (0 for breakeven, can be negative for a discount below cost).
    const costFields = [parsed.distance, parsed.kmPerLiter, parsed.pricePerLiter, parsed.wearCostPerKm];
    const isValid =
      costFields.every((value) => Number.isFinite(value) && value > 0) &&
      Number.isFinite(parsed.marginPercent);

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
        description="Calcula gratis cuánto deberías cobrar por tus envíos. Considera combustible y desgaste del vehículo. Sin registro."
        canonical={ROUTES.TOOLS_MOBILE}
        schema={{
          '@type': 'WebApplication',
          name: 'Calculadora de Móvil — Caldero Envío',
          description: 'Calcula gratis cuánto deberías cobrar por tus envíos.',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
        }}
      />
      <Header>
        <HeaderLogo to={ROUTES.LANDING} />
        <HeaderNav links={[{ to: ROUTES.TOOLS_MOBILE, label: 'Herramientas' }]} />
        {user ? (
          <HeaderUserMenu />
        ) : (
          <HeaderActions>
            <Link to={ROUTES.LOGIN}>
              <Button variant="ghost">Iniciar Sesión</Button>
            </Link>
            <Link to={ROUTES.REGISTER}>
              <Button variant="primary">Registrarse</Button>
            </Link>
          </HeaderActions>
        )}
      </Header>

      <main className="flex-1 w-full max-w-md mx-auto px-4 py-8">
        <h1 className="font-display text-display-sm font-semibold text-ink mb-2">
          ¿Cuánto cobrar por tu envío?
        </h1>
        <p className="font-sans text-sm text-muted mb-2">
          Calcula el costo estimado de combustible y desgaste para tus envíos.
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

        <MobileCalculatorValueProp />

        <form className="flex flex-col gap-4">
          <FormField
            label="Distancia de ida (km)"
            icon="map"
            hint="Solo la distancia de ida. Si volvés al local, dejamos el doble (ida y vuelta). Si no, marcá la opción."
            type="number"
            step="0.1"
            min="0"
            placeholder="ej: 4.5"
            value={inputs.distance}
            onChange={handleChange('distance')}
            required
          />
          <label className="flex items-center gap-2 -mt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={inputs.includeReturn}
              onChange={(e) => setInputs((prev) => ({ ...prev, includeReturn: e.target.checked }))}
              className="w-4 h-4 accent-gold"
            />
            <span className="font-sans text-sm text-muted">
              Vuelvo al local (calcular ida y vuelta)
            </span>
          </label>
          <FormField
            label="Consumo de tu vehículo (km/L)"
            icon="fuel"
            hint="¿Cuántos km haces con 1 litro de nafta? Si no lo sabes: auto promedio 10-15 km/L, moto 20-40 km/L. Mira el manual o calcúlalo: km ÷ litros cargados."
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
            hint="¿Cuánto cuesta hoy 1 litro de nafta? Mira el surtidor o apps tipo YPF/Shell. Usa el precio actual — cambia seguido."
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
            hint="Estima cuánto te sale mantener tu vehículo por cada km. Incluye: neumáticos (costo ÷ km de vida útil), aceite y filtros, amortización. Regla simple: auto $50-100/km, moto $20-40/km."
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
          <FormField
            label="Margen de ganancia (%)"
            icon="coin"
            hint="¿Cuánto querés ganar sobre tu costo? 25% es común para delivery urbano. Si querés solo cubrir gastos sin ganancia, poné 0."
            type="number"
            step="1"
            min="0"
            placeholder="ej: 25"
            value={inputs.marginPercent}
            onChange={handleChange('marginPercent')}
            required
          />
        </form>

        {result && (
          <MobileCalculatorResult
            fuelCostLabel={`$${formatter.format(result.fuelCost)}`}
            wearCostLabel={`$${formatter.format(result.wearCost)}`}
            costSubtotalLabel={`$${formatter.format(result.costSubtotal)}`}
            marginAmountLabel={`$${formatter.format(result.marginAmount)}`}
            priceLabel={`$${formatter.format(result.price)}`}
            marginPercent={result.marginPercent}
          />
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

        <MobileCalculatorTrustLine />
      </main>

      <footer className="text-center py-8 font-sans text-xs text-muted">
        © 2026 Caldero Envío. Todos los derechos reservados.
      </footer>
    </div>
  );
}
