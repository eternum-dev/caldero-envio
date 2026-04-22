import Button from '../atoms/Button';
import Icon from '../atoms/Icon';

export default function ActionButtons({
  onWhatsApp,
  onPrint,
  onReset,
  disabled = false,
  className = '',
}) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex gap-2">
        <Button
          variant="primary"
          size="lg"
          className="flex-1"
          onClick={onWhatsApp}
          disabled={disabled}
        >
          <Icon name="whatsapp" className="w-5 h-5 mr-2" />
          Enviar WhatsApp
        </Button>
        <Button variant="secondary" size="lg" onClick={onPrint} disabled={disabled}>
          <Icon name="printer" className="w-5 h-5" />
        </Button>
      </div>
      {onReset && (
        <Button variant="tertiary" size="md" onClick={onReset}>
          Nueva búsqueda
        </Button>
      )}
    </div>
  );
}
