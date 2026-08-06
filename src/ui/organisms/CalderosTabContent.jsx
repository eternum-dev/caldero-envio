import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCredits } from '../../hooks/useCredits';
import { useTransactions } from '../../hooks/useTransactions';
import CreditBalanceDisplay from '../molecules/CreditBalanceDisplay';
import PackageCardGrid from '../molecules/PackageCardGrid';
import TransactionList from '../molecules/TransactionList';
import { PACKAGES } from '../../utils/constants';
import {
  createCheckoutSession,
  checkPurchaseStatus,
  isMockCheckoutUrl,
} from '../../services/purchaseService';
import PurchaseProcessingModal from './PurchaseProcessingModal';
import MockCheckoutModal from './MockCheckoutModal';

/**
 * Calderos hub inside Settings.
 *
 * Batch E: purchase flow is wired to MercadoPago via Cloud Functions.
 * In mock mode (no MP credentials) a simulated checkout modal is shown instead
 * of redirecting to an external URL.
 *
 * @param {{ purchaseId?: string | null }} props
 */
export default function CalderosTabContent({ purchaseId }) {
  const { user } = useAuth();
  const { balance, loading: balanceLoading } = useCredits(user?.uid ?? null);
  const { transactions, loading: transactionsLoading } = useTransactions(user?.uid ?? null);

  const [loadingId, setLoadingId] = useState(null);
  const [modalStatus, setModalStatus] = useState(purchaseId ? 'processing' : null);
  const [modalBalance, setModalBalance] = useState(null);
  const [modalPackageId, setModalPackageId] = useState(null);
  const [mockPurchase, setMockPurchase] = useState(null);
  const [error, setError] = useState(null);

  const clearPurchaseParam = useCallback(() => {
    // eslint-disable-next-line no-undef
    if (typeof window === 'undefined' || !window.location.search.includes('purchase_id')) {
      return;
    }
    // eslint-disable-next-line no-undef
    const url = new URL(window.location.href);
    url.searchParams.delete('purchase_id');
    // eslint-disable-next-line no-undef
    window.history.replaceState({}, '', url.pathname + url.search);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalStatus(null);
    setModalBalance(null);
    setModalPackageId(null);
    clearPurchaseParam();
  }, [clearPurchaseParam]);

  const handlePurchase = useCallback(async (packageId) => {
    setError(null);
    setLoadingId(packageId);

    try {
      const { init_point, purchase_id } = await createCheckoutSession(packageId);

      if (isMockCheckoutUrl(init_point)) {
        setMockPurchase({ purchaseId: purchase_id, packageId });
      } else {
        // eslint-disable-next-line no-undef
        window.location.href = init_point;
      }
    } catch {
      setError('No pudimos iniciar la compra, intenta de nuevo');
    } finally {
      setLoadingId(null);
    }
  }, []);

  const finalizeStatus = useCallback((result) => {
    setModalStatus(result.status);
    setModalBalance(result.balance ?? null);
    setModalPackageId(result.packageId ?? null);
  }, []);

  const startRescue = useCallback(async (purchaseIdToCheck, mockAction) => {
    setModalStatus('processing');
    setModalBalance(null);
    try {
      const result = await checkPurchaseStatus(purchaseIdToCheck, mockAction);
      finalizeStatus(result);
    } catch {
      setModalStatus('not_found');
    }
  }, [finalizeStatus]);

  useEffect(() => {
    if (!purchaseId || modalStatus !== 'processing') {
      return;
    }
    let cancelled = false;
    checkPurchaseStatus(purchaseId)
      .then((result) => {
        if (cancelled) return;
        finalizeStatus(result);
      })
      .catch(() => {
        if (cancelled) return;
        setModalStatus('not_found');
      });
    return () => {
      cancelled = true;
    };
  }, [purchaseId, modalStatus, finalizeStatus]);

  function handleMockOutcome(action) {
    const { purchaseId: pid, packageId } = mockPurchase;
    setModalPackageId(packageId);
    setMockPurchase(null);
    startRescue(pid, action);
  }

  function handleMockClose() {
    setMockPurchase(null);
  }

  return (
    <div className="flex flex-col gap-8">
      {error && (
        <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-sm text-red-300 text-sm">
          {error}
        </div>
      )}

      <section>
        <CreditBalanceDisplay balance={balance} loading={balanceLoading} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-display-xs font-semibold text-ink">
          Recarga calderos
        </h2>
        <PackageCardGrid
          packages={Object.values(PACKAGES)}
          onSelect={handlePurchase}
          loadingId={loadingId}
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

      {mockPurchase && (
        <MockCheckoutModal
          purchaseId={mockPurchase.purchaseId}
          packageId={mockPurchase.packageId}
          onOutcome={handleMockOutcome}
          onClose={handleMockClose}
        />
      )}

      {modalStatus && (
        <PurchaseProcessingModal
          status={modalStatus}
          balance={modalBalance}
          packageName={modalPackageId ? PACKAGES[modalPackageId]?.name : undefined}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
