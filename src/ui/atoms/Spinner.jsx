export default function Spinner({ size = 'md', className = '', ...props }) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div
      className={`animate-spin rounded-full border-2 border-gold/20 border-t-gold ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
