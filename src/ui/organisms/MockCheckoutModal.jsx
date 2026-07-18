import { useState } from 'react';
import Button from '../atoms/Button';
import { formatCLP } from '../../utils/format';
import { PACKAGES } from '../../utils/constants';
import { checkPurchaseStatus } from '../../services/purchaseService';

/**
 * Simulated MercadoPago checkout page used only in mock mode.
 *
 * The user can pick an outcome (approve / reject / leave pending) and the
 * frontend calls checkPurchaseStatus with the corresponding mockAction so the
 * backend mock client resolves the payment.
 *
 * @param {{
 *   purchaseId: string,
 *   packageId: string,
 *   onOutcome: (status: 'approved' | 'rejected' | 'pending') => void,
 *   onClose: () => void
 * }} props
 */
export default function MockCheckoutModal({ purchaseId, packageId, onOutcome, onClose }) {
  const [loading, setLoading] = useState(false);
  const pkg = PACKAGES[packageId];

  async function resolve(action) {
    setLoading(true);
    try {
      await checkPurchaseStatus(purchaseId, action);
    } finally {
      setLoading(false);
    }
    onOutcome(action);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-surface border border-gold/18 rounded-[14px] p-6 max-w-sm w-full flex flex-col gap-6 shadow-floating"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex flex-col gap-1">
          <h3 className="font-display text-display-xs font-semibold text-ink">
            Simulación de checkout MercadoPago
          </h3>
          <p className="font-sans text-sm text-muted">
            Esto es solo un mock para probar el flujo sin credenciales reales.
          </p>
        </div>

        {pkg && (
          <div className="flex flex-col gap-1 rounded-sm bg-surface-2 p-4">
            <span className="font-display text-lg font-semibold text-ink">
              Paquete {pkg.name}
            </span>
            <span className="font-sans text-sm text-muted">
              {pkg.calderos.toLocaleString('es-CL')} calderos
            </span>
            <span className="font-display text-2xl font-semibold text-ink">
              {formatCLP(pkg.priceCLP)}
            </span>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button
            variant="primary"
            loading={loading}
            disabled={loading}
            onClick={() => resolve('approved')}
          >
            Aprobar pago
          </Button>
          <Button
            variant="secondary"
            disabled={loading}
            onClick={() => resolve('rejected')}
          >
            Rechazar pago
          </Button>
          <Button
            variant="ghost"
            disabled={loading}
            onClick={() => resolve('pending')}
          >
            Dejar pendiente
          </Button>
        </div>
      </div>
    </div>
  );
}
