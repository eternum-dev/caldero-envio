import Price from '../atoms/Price';

export default function PriceTag({ value, label, className = '' }) {
  return (
    <div className={`bg-surface-container rounded-md p-4 ${className}`}>
      {label && (
        <p className="text-label text-sm text-on-surface-variant mb-2 tracking-label">{label}</p>
      )}
      <Price value={value} size="md" />
    </div>
  );
}
