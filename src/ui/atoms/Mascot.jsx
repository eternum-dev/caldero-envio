export default function Mascot({ className = 'w-32 h-32', badge = false, ...props }) {
  if (badge) {
    return (
      <span className="inline-flex items-center justify-center rounded-full bg-gold-bg border border-gold/25 p-1">
        <img
          src="/mascot.svg"
          alt="Caldero Envío"
          className={className}
          {...props}
        />
      </span>
    );
  }

  return (
    <img
      src="/mascot.svg"
      alt="Caldero Envío"
      className={className}
      {...props}
    />
  );
}
