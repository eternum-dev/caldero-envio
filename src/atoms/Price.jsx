export default function Price({ value, className = '', size = 'md', ...props }) {
  const sizes = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-5xl',
    xl: 'text-7xl',
  }

  const formattedPrice = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(value)

  return (
    <div className={`font-bold text-display text-secondary ${sizes[size]} ${className}`} {...props}>
      {formattedPrice}
    </div>
  )
}