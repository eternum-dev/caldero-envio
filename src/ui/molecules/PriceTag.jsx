import Price from '../atoms/Price';

export default function PriceTag({ value, label, className = '' }) {
  return (
    <div className={`bg-surface border border-gold/18 rounded-[14px] p-4 flex flex-col gap-3.5 ${className}`}>
      {label && (
        <p className="text-label uppercase tracking-widest text-muted text-center">{label}</p>
      )}
      <Price value={value} />
    </div>
  );
}
