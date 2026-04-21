import Price from '../atoms/Price'

export default function PriceTag({ value, label, className = '' }) {
  return (
    <div className={`bg-primary-50 rounded-lg p-4 ${className}`}>
      {label && <p className="text-sm text-gray-600 mb-1">{label}</p>}
      <Price value={value} size="lg" />
    </div>
  )
}