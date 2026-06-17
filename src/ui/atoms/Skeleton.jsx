/**
 * Skeleton — placeholder loading component with shimmer effect.
 * Variants: text (default), circle, rect.
 */
export default function Skeleton({
  variant = 'text',
  width,
  height,
  className = '',
}) {
  const base =
    'bg-surface-2 bg-gradient-shimmer animate-shimmer bg-[length:200%_100%]';

  const variants = {
    text: 'h-4 rounded-sm w-full',
    circle: 'rounded-full',
    rect: 'rounded-sm',
  };

  const style = {
    width: width || (variant === 'circle' ? '2.5rem' : undefined),
    height: height || (variant === 'circle' ? '2.5rem' : undefined),
  };

  return (
    <div
      className={`${base} ${variants[variant]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}
