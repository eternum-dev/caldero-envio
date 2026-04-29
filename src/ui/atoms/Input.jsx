export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-label text-sm text-on-surface-variant mb-2 tracking-label">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 bg-surface-high rounded-md text-white placeholder:text-primary-fixed_dim focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all mb-2 ${error ? 'focus:ring-red-500' : ''}`}
        {...props}
      />
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
