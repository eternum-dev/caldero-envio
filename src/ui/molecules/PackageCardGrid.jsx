import PackageCard from '../atoms/PackageCard';
import { computeSavingsVsMini } from '../../utils/pricing';

/**
 * Responsive grid of package cards.
 *
 * @param {{
 *   packages: Array<{ id: string, name: string, calderos: number, priceCLP: number, unitPriceCLP: number }>,
 *   onSelect?: (id: string) => void,
 *   loadingId?: string | null,
 *   disabled?: boolean,
 *   className?: string
 * }} props
 */
export default function PackageCardGrid({
  packages,
  onSelect,
  loadingId,
  disabled = false,
  className = '',
}) {
  const baseline = packages.find(p => p.id === 'mini') || packages[0];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      {packages.map(pkg => {
        const badge = computeSavingsVsMini(pkg, baseline);
        return (
          <PackageCard
            key={pkg.id}
            package={pkg}
            onSelect={onSelect}
            badge={badge}
            loading={loadingId === pkg.id}
            disabled={disabled}
          />
        );
      })}
    </div>
  );
}
