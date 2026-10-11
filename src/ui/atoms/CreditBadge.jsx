import { forwardRef } from 'react';

/**
 * Credit balance badge.
 *
 * Desktop: "🪙 N calderos"
 * Mobile (< 768px): "N" (no emoji to save space — UX rule U-3)
 *
 * @param {{ balance: number, onClick?: () => void, className?: string }} props
 */
const CreditBadge = forwardRef(function CreditBadge(
  { balance, onClick, className = '' },
  ref,
) {
  const numericLabel = Number.isFinite(balance) ? balance : 0;
  const content = (
    <>
      <img
        src="/caldero-icon.svg"
        alt=""
        className="w-4 h-4 hidden md:inline-block"
        aria-hidden="true"
      />
      <span>{numericLabel}</span>
      <span className="hidden md:inline"> calderos</span>
    </>
  );

  const baseStyles =
    'inline-flex items-center gap-1 font-sans text-sm font-medium text-ink bg-surface-2 border border-gold/18 rounded-full px-3 py-1.5 transition-colors';

  if (onClick) {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className={`${baseStyles} hover:bg-surface-tint cursor-pointer ${className}`}
        aria-label={`Tienes ${numericLabel} calderos`}
      >
        {content}
      </button>
    );
  }

  return (
    <span
      ref={ref}
      className={`${baseStyles} ${className}`}
      aria-label={`Tienes ${numericLabel} calderos`}
    >
      {content}
    </span>
  );
});

export default CreditBadge;
