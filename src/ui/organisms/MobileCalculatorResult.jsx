import PropTypes from 'prop-types';

/**
 * Result card showing the breakdown: fuel + wear = total.
 * Receives pre-formatted strings to keep presentation decoupled from formatting.
 */
export default function MobileCalculatorResult({ fuelCostLabel, wearCostLabel, totalLabel }) {
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
      <div className="flex justify-between items-baseline">
        <span className="font-sans text-sm font-medium text-ink">Total sugerido</span>
        <span className="font-display text-2xl font-semibold text-gold">
          {totalLabel}
        </span>
      </div>
    </div>
  );
}

MobileCalculatorResult.propTypes = {
  fuelCostLabel: PropTypes.string.isRequired,
  wearCostLabel: PropTypes.string.isRequired,
  totalLabel: PropTypes.string.isRequired,
};
