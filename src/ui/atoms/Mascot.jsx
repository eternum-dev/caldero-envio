export default function Mascot({ className = 'w-32 h-32', ...props }) {
  return (
    <img
      src="/mascot.svg"
      alt="Caldero Envío"
      className={className}
      {...props}
    />
  );
}
