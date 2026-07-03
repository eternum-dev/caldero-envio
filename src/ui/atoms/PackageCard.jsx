import Button from './Button';
import PricingBadge from '../molecules/PricingBadge';
import { formatCLP } from '../../utils/format';

/**
 * Single prepaid caldero package card.
 *
 * @param {{
 *   package: { id: string, name: string, calderos: number, priceCLP: number },
 *   onSelect?: (id: string) => void,
 *   badge?: string | null,
 *   loading?: boolean,
 *   disabled?: boolean,
 *   className?: string
 * }} props
 */
export default function PackageCard({
  package: pkg,
  onSelect,
  badge,
  loading = false,
  disabled = false,
  className = '',
}) {
  const isActive = Boolean(onSelect) && !disabled && !loading;

  let buttonText = 'Próximamente';
  if (loading) {
    buttonText = 'Procesando...';
  } else if (isActive) {
    buttonText = 'Comprar';
  }

  return (
    <div
      className={`bg-surface border border-gold/18 rounded-[14px] p-6 flex flex-col gap-4 ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display text-display-sm font-semibold text-ink">{pkg.name}</h3>
        {badge && <PricingBadge text={badge} variant="savings" />}
      </div>

      <div className="flex flex-col gap-1">
        <span className="font-display text-3xl font-semibold text-ink">
          {formatCLP(pkg.priceCLP)}
        </span>
        <span className="font-sans text-sm text-muted">
          {pkg.calderos.toLocaleString('es-CL')} calderos
        </span>
        <span className="font-sans text-xs text-muted">
          IVA incluido
        </span>
      </div>

      <Button
        variant="primary"
        className="w-full mt-auto"
        disabled={!isActive || disabled}
        loading={loading}
        onClick={() => onSelect?.(pkg.id)}
      >
        {buttonText}
      </Button>
    </div>
  );
}
