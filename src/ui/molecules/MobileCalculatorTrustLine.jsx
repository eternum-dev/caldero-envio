import Icon from '../atoms/Icon';

/**
 * Trust line shown at the bottom of the calculator:
 * privacy reassurance + brand attribution.
 */
export default function MobileCalculatorTrustLine() {
  return (
    <div className="mt-8 pt-6 border-t border-gold/18 text-center">
      <p className="font-sans text-xs text-muted flex items-center justify-center gap-1.5">
        <Icon name="lock" className="w-3.5 h-3.5 text-gold-dim" />
        No guardamos nada. Calcula y te vas.
      </p>
      <p className="font-sans text-xs text-muted mt-1">
        Esta herramienta es parte de <strong>Caldero Envío</strong>, la app de gestión de envíos para tu local.
      </p>
    </div>
  );
}
