export default function Badge({ children, variant = 'default', className = '', ...props }) {
  const variants = {
    default: 'bg-gold-bg border border-gold/25 text-gold-dim',
    primary: 'bg-gold-bg border border-gold/25 text-gold-dim',
    success: 'bg-green-900/30 text-green-400',
    warning: 'bg-yellow-900/30 text-yellow-400',
    danger: 'bg-red-900/30 text-red-400',
    inTransit: 'bg-yellow-900/30 text-yellow-400',
    delivered: 'bg-green-900/30 text-green-400',
  };

  return (
    <span
      className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-sans ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
