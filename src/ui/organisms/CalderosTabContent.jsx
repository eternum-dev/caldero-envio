import { useAuth } from '../../contexts/AuthContext';
import { useCredits } from '../../hooks/useCredits';
import { useTransactions } from '../../hooks/useTransactions';
import CreditBalanceDisplay from '../molecules/CreditBalanceDisplay';
import PackageCardGrid from '../molecules/PackageCardGrid';
import TransactionList from '../molecules/TransactionList';
import { PACKAGES } from '../../utils/constants';

/**
 * Calderos hub inside Settings.
 *
 * Batch C: purchase buttons are disabled and show "Próximamente".
 * purchaseId/onPurchaseStatusResolved are accepted as props but ignored here;
 * they will be wired in Session 3 (Batch E).
 *
 * @param {{ purchaseId?: string | null, onPurchaseStatusResolved?: (status: string) => void }} props
 */
export default function CalderosTabContent({ purchaseId, onPurchaseStatusResolved }) {
  const { user } = useAuth();
  const { balance, loading: balanceLoading } = useCredits(user?.uid ?? null);
  const { transactions, loading: transactionsLoading } = useTransactions(user?.uid ?? null);

  // eslint-disable-next-line no-unused-vars
  const _unused = { purchaseId, onPurchaseStatusResolved };

  return (
    <div className="flex flex-col gap-8">
      <section>
        <CreditBalanceDisplay balance={balance} loading={balanceLoading} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-display-xs font-semibold text-ink">
          Recarga calderos
        </h2>
        <PackageCardGrid
          packages={Object.values(PACKAGES)}
          disabled
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-display-xs font-semibold text-ink">
          Historial
        </h2>
        <TransactionList
          transactions={transactions}
          loading={transactionsLoading}
        />
      </section>

      <section>
        <p className="font-sans text-xs text-muted leading-relaxed">
          Por el momento no emitimos boleta. Este servicio se declara como
          &quot;otros ingresos&quot; en tu declaración anual. Consulta con tu
          contador.
        </p>
      </section>
    </div>
  );
}
