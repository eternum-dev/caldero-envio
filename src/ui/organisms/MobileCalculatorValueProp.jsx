import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '../atoms/Icon';

const BULLETS = [
  'Quieres saber si te conviene aceptar un envío que te ofrecen',
  'Necesitas fijar un precio justo para tus clientes',
  'Quieres entender qué parte del cobro es combustible y qué parte es desgaste',
];

/**
 * "Why use this calculator" section above the form.
 * Collapsible: the title is always visible; the rest expands with a
 * smooth max-height transition. Saves screen real estate for users
 * who already understand the value and just want to calculate.
 */
export default function MobileCalculatorValueProp() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="bg-surface-2 rounded-md border border-gold/18 mb-6 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-surface-low/50 transition-colors"
        aria-expanded={isExpanded}
        aria-controls="value-prop-body"
      >
        <h2 className="font-display text-lg font-semibold text-ink">
          ¿Haces envíos por tu cuenta?
        </h2>
        <Icon
          name="chevronRight"
          className={`w-5 h-5 text-gold-dim shrink-0 transition-transform duration-300 ${
            isExpanded ? 'rotate-90' : ''
          }`}
        />
      </button>
      <div
        id="value-prop-body"
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-5 pb-5">
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
        </div>
      </div>
    </section>
  );
}

MobileCalculatorValueProp.propTypes = {};
