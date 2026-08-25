import { useState, useMemo, useCallback } from 'react';
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

const EXAMPLE_INPUTS = {
  distance: '4.5',
  kmPerLiter: '12',
  pricePerLiter: '1200',
  wearCostPerKm: '80',
  marginPercent: '25',
  includeReturn: true,
};

function parseInputs(inputs) {
  return {
    distance: parseFloat(inputs.distance),
    kmPerLiter: parseFloat(inputs.kmPerLiter),
    pricePerLiter: parseFloat(inputs.pricePerLiter),
    wearCostPerKm: parseFloat(inputs.wearCostPerKm),
    marginPercent: parseFloat(inputs.marginPercent),
    includeReturn: inputs.includeReturn,
  };
}

function isParsedValid(parsed) {
  const costFields = [parsed.distance, parsed.kmPerLiter, parsed.pricePerLiter, parsed.wearCostPerKm];
  return (
    costFields.every((value) => Number.isFinite(value) && value > 0) &&
    Number.isFinite(parsed.marginPercent)
  );
}

export default function MobileCalculator() {
  const [inputs, setInputs] = useState(INITIAL_INPUTS);
  const [result, setResult] = useState(null);
  const { user } = useAuth();

  const parsed = useMemo(() => parseInputs(inputs), [inputs]);
  const isValid = useMemo(() => isParsedValid(parsed), [parsed]);

  const clearResult = useCallback(() => {
    setResult((prev) => (prev === null ? prev : null));
  }, []);

  const handleChange = (field) => (event) => {
    setInputs((prev) => ({ ...prev, [field]: event.target.value }));
    clearResult();
  };

  const handleCheckboxChange = (event) => {
    setInputs((prev) => ({ ...prev, includeReturn: event.target.checked }));
    clearResult();
  };

  const handleCalculate = useCallback(() => {
    if (!isValid) return;
    try {
      setResult(calculateMobileCost(parsed));
    } catch {
      setResult(null);
    }
  }, [isValid, parsed]);

  const handleTryExample = useCallback(() => {
    // Fill the form with example values; user must still click "Calcular"
    // for consistency with the button-based flow.
    setInputs((prev) => ({ ...prev, ...EXAMPLE_INPUTS }));
    setResult(null);
  }, []);

  const handleClear = useCallback(() => {
    setInputs(INITIAL_INPUTS);
    setResult(null);
  }, []);

  const handleWearPreset = useCallback((value) => {
    setInputs((prev) => ({ ...prev, wearCostPerKm: value }));
    setResult(null);
  }, []);

  const formatter = useMemo(() => new Intl.NumberFormat('es-AR'), []);

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

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-6 py-8">
        {/* Top: title + subtitle (centered) */}
        <div className="text-center mb-6 max-w-2xl mx-auto">
          <h1 className="font-display text-display-sm md:text-display-md font-semibold text-ink mb-2">
            ¿Cuánto cobrar por tu envío?
          </h1>
          <p className="font-sans text-sm text-muted">
            Calcula el costo estimado de combustible y desgaste para tus envíos.
          </p>
        </div>

        <MobileCalculatorValueProp />

        {/* Two-column layout on desktop: form on the left, result on the right */}
        <div className="grid md:grid-cols-2 md:gap-8 lg:gap-12 items-start">
          <form
            className="flex flex-col gap-8"
            onSubmit={(event) => {
              event.preventDefault();
              handleCalculate();
            }}
          >
            {/* El viaje */}
            <div className="space-y-3">
              <h3 className="font-sans text-xs uppercase tracking-widest text-muted font-medium">
                El viaje
              </h3>
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
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inputs.includeReturn}
                  onChange={handleCheckboxChange}
                  className="w-4 h-4 accent-gold"
                />
                <span className="font-sans text-sm text-muted">
                  Vuelvo al local (calcular ida y vuelta)
                </span>
              </label>
            </div>

            {/* Tu vehículo */}
            <div className="space-y-3">
              <h3 className="font-sans text-xs uppercase tracking-widest text-muted font-medium">
                Tu vehículo
              </h3>
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
              <div className="space-y-2">
                <FormField
                  label="Costo de uso por km ($/km)"
                  icon="wrench"
                  hint="Estima cuánto te sale mantener tu vehículo por cada km. Incluye: neumáticos (costo ÷ km de vida útil), aceite y filtros, amortización. Si no lo sabés exacto, usá un valor sugerido abajo."
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="ej: 80"
                  value={inputs.wearCostPerKm}
                  onChange={handleChange('wearCostPerKm')}
                  required
                />
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="font-sans text-xs text-muted">¿No sabés el número?</span>
                  <button
                    type="button"
                    onClick={() => handleWearPreset('80')}
                    className="px-2 py-0.5 text-xs font-sans rounded-sm border border-gold/18 bg-surface-low text-gold-dim hover:text-gold hover:border-gold/40 transition-colors"
                  >
                    Auto ~$80
                  </button>
                  <button
                    type="button"
                    onClick={() => handleWearPreset('30')}
                    className="px-2 py-0.5 text-xs font-sans rounded-sm border border-gold/18 bg-surface-low text-gold-dim hover:text-gold hover:border-gold/40 transition-colors"
                  >
                    Moto ~$30
                  </button>
                  <button
                    type="button"
                    onClick={() => handleWearPreset('120')}
                    className="px-2 py-0.5 text-xs font-sans rounded-sm border border-gold/18 bg-surface-low text-gold-dim hover:text-gold hover:border-gold/40 transition-colors"
                  >
                    Camioneta ~$120
                  </button>
                </div>
              </div>
            </div>

            {/* Tu ganancia */}
            <div className="space-y-3">
              <h3 className="font-sans text-xs uppercase tracking-widest text-muted font-medium">
                Tu ganancia
              </h3>
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
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full min-h-[44px]"
                disabled={!isValid}
              >
                Calcular
              </Button>
              <button
                type="button"
                onClick={handleTryExample}
                className="self-center w-full text-sm text-gold-dim hover:text-gold underline underline-offset-2"
              >
                Probar con valores de ejemplo
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="self-center w-full text-sm text-muted hover:text-ink transition-colors"
              >
                Limpiar
              </button>
            </div>
          </form>

          {/* Right column: result or empty state */}
          <div className="md:sticky md:top-8 pt-2 md:pt-0">
            {result ? (
              <>
                <MobileCalculatorResult
                  fuelCostLabel={`$${formatter.format(result.fuelCost)}`}
                  wearCostLabel={`$${formatter.format(result.wearCost)}`}
                  costSubtotalLabel={`$${formatter.format(result.costSubtotal)}`}
                  marginAmountLabel={`$${formatter.format(result.marginAmount)}`}
                  priceLabel={`$${formatter.format(result.price)}`}
                  marginPercent={result.marginPercent}
                />
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full mt-4 min-h-[44px]"
                  onClick={() => openWhatsAppShare(prepareMobileCostMessage(result))}
                >
                  <Icon name="whatsapp" className="w-5 h-5 mr-2" />
                  Enviar por WhatsApp
                </Button>
              </>
            ) : (
              <div className="bg-surface-low border border-gold/18 border-dashed rounded-md p-8 text-center">
                <p className="font-sans text-sm text-muted mb-1">
                  Tu cálculo va a aparecer acá.
                </p>
                <p className="font-sans text-xs text-muted">
                  Completá los datos del formulario y tocá "Calcular" (o usá los valores de ejemplo y después "Calcular").
                </p>
              </div>
            )}
          </div>
        </div>

        <MobileCalculatorTrustLine />
      </main>

      <footer className="text-center py-8 font-sans text-xs text-muted">
        © 2026 Caldero Envío. Todos los derechos reservados.
      </footer>
    </div>
  );
}
