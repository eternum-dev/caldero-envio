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
          variant="secondary"
          size="lg"
          className="flex-1 bg-[#25D366] border-none text-white hover:bg-[#20bd5a]"
          onClick={onWhatsApp}
          disabled={disabled}
        >
          <Icon name="whatsapp" className="w-5 h-5 mr-2" />
          Enviar WhatsApp
        </Button>
        <Button variant="secondary" size="xl" className="w-[42px] !px-0" onClick={onPrint} disabled={disabled}>
          <Icon name="printer" className="w-5 h-5" />
        </Button>
      </div>
      {onReset && (
        <Button
          variant="ghost"
          size="md"
          onClick={onReset}
          className="w-full border border-gold/18 text-center mt-4"
        >
          Nueva búsqueda
        </Button>
      )}
    </div>
  );
}
