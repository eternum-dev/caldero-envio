export default function Mascot({ className = 'w-32 h-32', badge = false, ...props }) {
  if (badge) {
    return (
      <span className="inline-flex items-center justify-center rounded-full bg-gold/20 border border-gold/35 p-1">
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
