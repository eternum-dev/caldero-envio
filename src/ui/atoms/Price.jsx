export default function Price({ value, className = '', size = 'md', ...props }) {
  const sizes = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-5xl',
    xl: 'text-7xl',
  };

  const formattedPrice = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

  return (
    <div className={`font-bold text-display text-secondary text-center ${sizes[size]} ${className}`} {...props}>
      {formattedPrice}
    </div>
  );
}
