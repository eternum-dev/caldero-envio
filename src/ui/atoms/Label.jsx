export default function Label({ children, className = '', required = false, ...props }) {
  return (
    <label
      className={`block text-label text-sm text-on-surface-variant tracking-label ${className}`}
      {...props}
    >
      {children}
      {required && <span className="text-secondary ml-1">*</span>}
    </label>
  );
}
