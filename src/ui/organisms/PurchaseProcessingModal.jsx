import Button from '../atoms/Button';
import Spinner from '../atoms/Spinner';
import Icon from '../atoms/Icon';

/**
 * Modal shown while resolving the post-checkout purchase status.
 *
 * @param {{
 *   status: 'processing' | 'credited' | 'pending' | 'rejected' | 'not_found',
 *   balance?: number,
 *   packageName?: string,
 *   onClose: () => void
 * }} props
 */
export default function PurchaseProcessingModal({
  status,
  balance,
  packageName,
  onClose,
}) {
  const content = {
    processing: {
      icon: <Spinner size="lg" />,
      title: 'Procesando tu compra',
      message: 'Estamos confirmando el pago con MercadoPago...',
      primary: null,
    },
    credited: {
      icon: (
        <div className="w-14 h-14 rounded-full bg-green-900/30 text-green-400 flex items-center justify-center">
          <Icon name="check" className="w-8 h-8" />
        </div>
      ),
      title: '¡Compra acreditada!',
      message:
        typeof balance === 'number'
          ? `Ahora tienes ${balance.toLocaleString('es-CL')} calderos disponibles.`
          : 'Tu compra fue acreditada correctamente.',
      primary: { label: 'Listo', action: onClose },
    },
    pending: {
      icon: (
        <div className="w-14 h-14 rounded-full bg-gold-bg text-gold flex items-center justify-center">
          <Icon name="clock" className="w-8 h-8" />
        </div>
      ),
      title: 'Pago en proceso',
      message: 'Tu pago está siendo procesado. Te avisaremos cuando se acrediten los calderos.',
      primary: { label: 'Entendido', action: onClose },
    },
    rejected: {
      icon: (
        <div className="w-14 h-14 rounded-full bg-red-900/30 text-red-400 flex items-center justify-center">
          <Icon name="x" className="w-8 h-8" />
        </div>
      ),
      title: 'Pago rechazado',
      message: 'No se pudo completar el pago. Puedes intentar con otro medio de pago.',
      primary: { label: 'Volver', action: onClose },
    },
    not_found: {
      icon: (
        <div className="w-14 h-14 rounded-full bg-red-900/30 text-red-400 flex items-center justify-center">
          <Icon name="x" className="w-8 h-8" />
        </div>
      ),
      title: 'Compra no encontrada',
      message: 'No encontramos esa compra. Si ya pagaste, contacta a soporte.',
      primary: { label: 'Volver', action: onClose },
    },
  };

  const current = content[status] || content.processing;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-surface border border-gold/18 rounded-[14px] p-6 max-w-sm w-full flex flex-col items-center gap-4 text-center shadow-floating"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-live="polite"
      >
        {current.icon}
        <div className="flex flex-col gap-2">
          <h3 className="font-display text-display-xs font-semibold text-ink">
            {current.title}
          </h3>
          <p className="font-sans text-sm text-muted">
            {current.message}
          </p>
          {packageName && (
            <p className="font-sans text-sm text-ink">Paquete {packageName}</p>
          )}
        </div>
        {current.primary && (
          <Button className="w-full" onClick={current.primary.action}>
            {current.primary.label}
          </Button>
        )}
      </div>
    </div>
  );
}
