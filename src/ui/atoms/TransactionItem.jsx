import Icon from './Icon';
import { formatRelativeDate } from '../../utils/format';

/**
 * Single transaction row for the calderos history.
 *
 * @param {{
 *   transaction: {
 *     id: string,
 *     type: 'free' | 'topup',
 *     amount: number,
 *     balanceAfter: number,
 *     createdAt?: number | Date | { seconds: number, nanoseconds: number }
 *   },
 *   packageName?: string
 * }} props
 */
export default function TransactionItem({ transaction, packageName }) {
  const isTopup = transaction.type === 'topup';
  const parts = [
    `+${transaction.amount} calderos`,
    packageName,
    formatRelativeDate(transaction.createdAt),
  ].filter(Boolean);

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gold/10 last:border-b-0">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isTopup ? 'bg-green-900/30 text-green-400' : 'bg-gold-bg text-gold'
        }`}
      >
        {isTopup ? (
          <Icon name="plus" className="w-4 h-4" />
        ) : (
          <span aria-hidden="true">🎁</span>
        )}
      </div>

      <div className="flex flex-col gap-0.5 min-w-0">
        <p className="font-sans text-sm text-ink truncate">{parts.join(' · ')}</p>
        <p className="font-sans text-xs text-muted">
          Saldo: {transaction.balanceAfter}
        </p>
      </div>
    </div>
  );
}
