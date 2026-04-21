export default function Price({ value, className = '', size = 'lg', ...props }) {
  const sizes = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
    xl: 'text-7xl',
  }

  const formattedPrice = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(value)

  return (
    <div className={`font-bold text-primary-600 ${sizes[size]} ${className}`} {...props}>
      {formattedPrice}
    </div>
  )
}