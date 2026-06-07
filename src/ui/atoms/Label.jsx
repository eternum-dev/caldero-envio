export default function Label({ children, className = '', required = false, ...props }) {
  return (
    <label
      className={`block font-sans text-label uppercase tracking-widest text-muted mb-1.5 ${className}`}
      {...props}
    >
      {children}
      {required && <span className="text-gold-dim ml-0.5">*</span>}
    </label>
  );
}
