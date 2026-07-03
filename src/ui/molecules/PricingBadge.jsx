import Badge from '../atoms/Badge';

/**
 * Wrapper over Badge for pricing-specific labels.
 *
 * @param {{ text: string, variant?: 'savings' | 'popular', className?: string }} props
 */
export default function PricingBadge({ text, variant = 'savings', className = '' }) {
  const badgeVariant = variant === 'popular' ? 'primary' : 'success';

  return (
    <Badge variant={badgeVariant} className={className}>
      {variant === 'popular' && (
        <span className="mr-1" aria-hidden="true">★</span>
      )}
      {text}
    </Badge>
  );
}
