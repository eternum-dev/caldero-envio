import PropTypes from 'prop-types';
import Icon from '../atoms/Icon';

const BULLETS = [
  'Quieres saber si te conviene aceptar un envío que te ofrecen',
  'Necesitas fijar un precio justo para tus clientes',
  'Quieres entender qué parte del cobro es combustible y qué parte es desgaste',
];

/**
 * "Why use this calculator" section shown above the form.
 * Static presentational organism — no state, no callbacks.
 */
export default function MobileCalculatorValueProp() {
  return (
    <section className="bg-surface-2 rounded-md p-5 mb-6 border border-gold/18">
      <h2 className="font-display text-lg font-semibold text-ink mb-3">
        ¿Haces envíos por tu cuenta?
      </h2>
      <p className="font-sans text-sm text-muted mb-3">
        Esta calculadora te ayuda a estimar el costo real
        de cada viaje — combustible + desgaste del vehículo — para que sepas qué precio ponerle.
      </p>
      <ul className="space-y-2 text-sm text-muted">
        {BULLETS.map((text) => (
          <li key={text} className="flex gap-2">
            <Icon name="check" className="w-4 h-4 text-gold-dim shrink-0 mt-0.5" />
            <span>{text}</span>
          </li>
        ))}
      </ul>
      <p className="font-sans text-xs text-muted mt-3 italic">
        Solo necesitas 4 datos que ya conoces de tu vehículo.
      </p>
    </section>
  );
}

MobileCalculatorValueProp.propTypes = {};
