import TransactionItem from '../atoms/TransactionItem';
import Skeleton from '../atoms/Skeleton';
import { PACKAGES } from '../../utils/constants';

/**
 * List of caldero transactions.
 *
 * @param {{
 *   transactions: Array<object>,
 *   loading?: boolean,
 *   emptyMessage?: string,
 *   className?: string
 * }} props
 */
export default function TransactionList({
  transactions = [],
  loading = false,
  emptyMessage = 'Aún no tienes movimientos',
  className = '',
}) {
  if (loading) {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <Skeleton variant="text" height="3.5rem" className="rounded-sm" />
        <Skeleton variant="text" height="3.5rem" className="rounded-sm" />
        <Skeleton variant="text" height="3.5rem" className="rounded-sm" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <p className={`font-sans text-sm text-muted ${className}`}>{emptyMessage}</p>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {transactions.map(tx => {
        const packageName = tx.packageId ? PACKAGES[tx.packageId]?.name : undefined;
        return <TransactionItem key={tx.id} transaction={tx} packageName={packageName} />;
      })}
    </div>
  );
}
