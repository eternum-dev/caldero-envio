export default function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full bg-surface-2 border border-gold/18 rounded-sm px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-gold/35 transition-colors ${className}`}
      {...props}
    />
  );
}
