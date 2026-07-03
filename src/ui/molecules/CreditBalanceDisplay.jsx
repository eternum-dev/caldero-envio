import Skeleton from '../atoms/Skeleton';

/**
 * Large credit balance display with label.
 *
 * @param {{ balance: number, loading?: boolean, className?: string }} props
 */
export default function CreditBalanceDisplay({ balance, loading = false, className = '' }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {loading ? (
        <>
          <Skeleton variant="text" width="8rem" height="3.5rem" className="rounded-sm" />
          <Skeleton variant="text" width="10rem" height="1rem" className="rounded-sm" />
        </>
      ) : (
        <>
          <span
            className="font-display text-5xl font-semibold text-ink"
            aria-label={`${balance} calderos disponibles`}
          >
            {balance}
          </span>
          <span className="font-sans text-sm text-muted">calderos disponibles</span>
        </>
      )}
    </div>
  );
}
