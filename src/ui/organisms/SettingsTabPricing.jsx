import PropTypes from 'prop-types';
import FormField from '../molecules/FormField';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';

/**
 * Settings tab: distance-based pricing rules with add/remove rows and save button.
 * Pure presentational — all state and handlers live in the parent Settings page.
 */
export default function SettingsTabPricing({
  pricingRules,
  loading,
  onChange,
  onAdd,
  onSave,
}) {
  return (
    <div className="bg-surface border border-gold/18 rounded-[14px] p-5">
      <h3 className="font-display text-display-sm font-semibold text-ink mb-6">Tarifas por Distancia</h3>

      <div className="space-y-3">
        {pricingRules.map((rule, index) => (
          <div key={index} className="grid grid-cols-3 gap-2.5">
            <FormField
              label="Desde (km)"
              type="number"
              step="0.1"
              value={rule.minKm}
              disabled
            />
            <FormField
              label="Hasta (km)"
              type="number"
              step="0.1"
              value={rule.maxKm || ''}
              onChange={e =>
                onChange(index, 'maxKm', e.target.value ? parseFloat(e.target.value) : null)
              }
              placeholder="∞"
            />
            <FormField
              label="Precio ($)"
              type="number"
              value={rule.price}
              onChange={e => onChange(index, 'price', parseFloat(e.target.value))}
            />
          </div>
        ))}
      </div>

      <Button variant="ghost" onClick={onAdd} className="mt-4">
        <Icon name="plus" className="w-4 h-4 mr-2" />
        Agregar regla
      </Button>

      <Button variant="primary" onClick={onSave} loading={loading} className="mt-6 w-fit" size='md'>
        Guardar Tarifas
      </Button>
    </div>
  );
}

SettingsTabPricing.propTypes = {
  pricingRules: PropTypes.arrayOf(
    PropTypes.shape({ minKm: PropTypes.number, maxKm: PropTypes.number, price: PropTypes.number })
  ).isRequired,
  loading: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};
