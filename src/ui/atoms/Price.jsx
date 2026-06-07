export default function Price({ value, className = '', ...props }) {
  const formattedPrice = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

  return (
    <div
      className={`flex items-baseline justify-center gap-1 animate-price-in ${className}`}
      {...props}
    >
      <span className="font-display text-[22px] text-gold-dim">$</span>
      <span className="font-display text-price font-semibold text-gold leading-none">
        {formattedPrice.replace('$', '').trim()}
      </span>
    </div>
  );
}
