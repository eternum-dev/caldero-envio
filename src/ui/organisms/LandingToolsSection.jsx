import { Link } from 'react-router-dom';
import Icon from '../atoms/Icon';
import { ROUTES } from '../../utils/constants';

const TOOLS = [
  {
    to: ROUTES.TOOLS_MOBILE,
    icon: 'moped',
    title: 'Calculadora de costo de móvil',
    description:
      '¿Cuánto deberías cobrar por tus envíos? Calculá el costo real (combustible + desgaste) y un precio sugerido con margen. Sin registro, 100% gratis.',
    cta: 'Probar la calculadora',
  },
  {
    comingSoon: true,
    icon: 'plus',
    title: 'Próximamente',
    description:
      'Estamos construyendo más calculadoras para tu negocio. ¿Tenés una idea de herramienta útil que te gustaría ver acá?',
  },
];

/**
 * "Herramientas gratuitas" section on the landing page.
 * Showcases the free tools Caldero Envío offers to anyone
 * (no signup required). Card-driven, can grow as more tools
 * are added.
 */
export default function LandingToolsSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <span className="inline-block font-sans text-xs uppercase tracking-widest text-gold-dim mb-3">
          Para empezar ahora
        </span>
        <h2 className="font-display text-display-sm font-semibold text-ink mb-3">
          Herramientas gratuitas
        </h2>
        <p className="font-sans text-sm text-muted max-w-xl mx-auto">
          Calculadoras y utilidades para que tu negocio funcione mejor. Sin registro, sin costo, sin
          letra chica.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {TOOLS.map((tool) =>
          tool.comingSoon ? (
            <div
              key={tool.title}
              className="block bg-surface-low border border-dashed border-gold/18 rounded-md p-5"
            >
              <div className="flex items-start gap-3 mb-3">
                <Icon name={tool.icon} className="w-6 h-6 text-muted shrink-0 mt-0.5" />
                <h3 className="font-display text-base font-semibold text-muted">{tool.title}</h3>
              </div>
              <p className="font-sans text-sm text-muted leading-relaxed">{tool.description}</p>
            </div>
          ) : (
            <Link
              key={tool.to}
              to={tool.to}
              className="group block bg-surface border border-gold/18 rounded-md p-5 hover:border-gold/40 hover:shadow-floating transition-all"
            >
              <div className="flex items-start gap-3 mb-3">
                <Icon name={tool.icon} className="w-6 h-6 text-gold-dim shrink-0 mt-0.5" />
                <h3 className="font-display text-base font-semibold text-ink group-hover:text-gold-dim transition-colors">
                  {tool.title}
                </h3>
              </div>
              <p className="font-sans text-sm text-muted mb-4 leading-relaxed">{tool.description}</p>
              <span className="inline-flex items-center gap-1 text-sm text-gold-dim group-hover:text-gold font-medium transition-colors">
                {tool.cta}
                <Icon name="chevronRight" className="w-4 h-4" />
              </span>
            </Link>
          )
        )}
      </div>
    </section>
  );
}
