export default function Badge({ children, variant = 'default', className = '', ...props }) {
  const variants = {
    default: 'bg-surface-medium text-on-surface-variant',
    primary: 'bg-primary/20 text-primary',
    success: 'bg-green-900/30 text-green-400',
    warning: 'bg-yellow-900/30 text-yellow-400',
    danger: 'bg-red-900/30 text-red-400',
    inTransit: 'status-in-transit',
    delivered: 'status-delivered',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
