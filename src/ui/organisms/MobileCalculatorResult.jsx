import PropTypes from 'prop-types';

/**
 * Result card showing the full breakdown: fuel + wear = cost, then + margin = price.
 * Receives pre-formatted strings to keep presentation decoupled from formatting.
 *
 * Visual layout (top to bottom):
 *   - Combustible
 *   - Desgaste
 *   - ─── (divider)
 *   - Costo estimado   (subtotal)
 *   - Margen (XX%)     (profit portion)
 *   - ═══ (divider)
 *   - Precio sugerido  (the big number, what to charge)
 */
export default function MobileCalculatorResult({
  fuelCostLabel,
  wearCostLabel,
  costSubtotalLabel,
  marginAmountLabel,
  priceLabel,
  marginPercent,
}) {
  return (
    <div className="mt-6 bg-surface border border-gold/18 rounded-sm p-5">
      <div className="flex justify-between font-sans text-sm text-muted mb-2">
        <span>Combustible</span>
        <span className="text-ink">{fuelCostLabel}</span>
      </div>
      <div className="flex justify-between font-sans text-sm text-muted mb-3">
        <span>Desgaste</span>
        <span className="text-ink">{wearCostLabel}</span>
      </div>
      <hr className="border-gold/18 mb-3" />
      <div className="flex justify-between font-sans text-sm text-ink mb-2">
        <span>Costo estimado</span>
        <span>{costSubtotalLabel}</span>
      </div>
      <div className="flex justify-between font-sans text-sm text-muted mb-3">
        <span>Margen ({marginPercent}%)</span>
        <span>{marginAmountLabel}</span>
      </div>
      <hr className="border-gold/30 mb-3" />
      <div className="flex justify-between items-baseline">
        <span className="font-sans text-sm font-medium text-ink">Precio sugerido</span>
        <span className="font-display text-2xl font-semibold text-gold">{priceLabel}</span>
      </div>
    </div>
  );
}

MobileCalculatorResult.propTypes = {
  fuelCostLabel: PropTypes.string.isRequired,
  wearCostLabel: PropTypes.string.isRequired,
  costSubtotalLabel: PropTypes.string.isRequired,
  marginAmountLabel: PropTypes.string.isRequired,
  priceLabel: PropTypes.string.isRequired,
  marginPercent: PropTypes.number.isRequired,
};
