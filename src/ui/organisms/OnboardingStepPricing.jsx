import PropTypes from 'prop-types';
import FormField from '../molecules/FormField';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';

/**
 * Step 3 of onboarding: CRUD interface for distance-based pricing rules
 * with validation error highlighting per row.
 * Pure presentational — all state lives in the parent orchestrator.
 */
export default function OnboardingStepPricing({
  pricingRules,
  pricingErrors,
  onPricingChange,
  onAddRule,
  onRemoveRule,
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-on-surface-variant mb-4">
        Configura las tarifas según distancia. El precio se aplica al rango correspondiente.
      </p>

      <div className="space-y-3">
        {pricingRules.map((rule, index) => (
          <div key={index}>
            <div
              className={`flex gap-2 items-end p-3 rounded-md ${
                pricingErrors[index] ? 'bg-error-container/20 border border-error' : ''
              }`}
            >
              <FormField
                label="Desde (km)"
                type="number"
                step="0.1"
                value={rule.minKm}
                onChange={e => onPricingChange(index, 'minKm', e.target.value)}
                className="w-24"
              />
              <FormField
                label="Hasta (km)"
                type="number"
                step="0.1"
                value={rule.maxKm ?? ''}
                onChange={e => onPricingChange(index, 'maxKm', e.target.value)}
                placeholder="∞"
                className="w-24"
              />
              <FormField
                label="Precio ($)"
                type="number"
                value={rule.price}
                onChange={e => onPricingChange(index, 'price', e.target.value)}
                className="w-32"
              />
              {pricingRules.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveRule(index)}
                >
                  <Icon name="x" className="w-4 h-4" />
                </Button>
              )}
            </div>
            {pricingErrors[index] && (
              <p className="mt-1 text-sm text-red-400 px-3">{pricingErrors[index]}</p>
            )}
          </div>
        ))}
      </div>

      <Button type="button" variant="tertiary" onClick={onAddRule} className="mt-2">
        <Icon name="plus" className="w-4 h-4 mr-2" />
        Agregar regla
      </Button>
    </div>
  );
}

OnboardingStepPricing.propTypes = {
  pricingRules: PropTypes.arrayOf(
    PropTypes.shape({ minKm: PropTypes.number, maxKm: PropTypes.number, price: PropTypes.number })
  ).isRequired,
  pricingErrors: PropTypes.array.isRequired,
  onPricingChange: PropTypes.func.isRequired,
  onAddRule: PropTypes.func.isRequired,
  onRemoveRule: PropTypes.func.isRequired,
};