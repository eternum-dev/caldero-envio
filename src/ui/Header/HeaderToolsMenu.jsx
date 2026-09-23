/* global document */
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../atoms/Icon';
import { useClickOutside } from './useClickOutside';
import { ROUTES } from '../../utils/constants';

const TOOLS = [
  {
    to: ROUTES.TOOLS_MOBILE,
    icon: 'moped',
    title: 'Calculadora de costo de móvil',
    description: 'Cuánto cobrar por tus envíos (combustible + desgaste + margen).',
  },
];

/**
 * Header dropdown menu that lists all available tools.
 * Click the wrench icon to open/close. Click outside or press Esc to close.
 */
export default function HeaderToolsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useClickOutside(wrapperRef, () => setIsOpen(false));

  useEffect(() => {
    if (!isOpen) return undefined;
    const handler = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Herramientas"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="flex items-center gap-1 text-muted hover:text-gold-dim font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm p-1"
      >
        <Icon name="settings" className="w-5 h-5" />
        <Icon
          name="chevronDown"
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Herramientas"
          className="absolute top-full right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] bg-surface border border-gold/18 rounded-md shadow-lg p-2 z-50"
        >
          {TOOLS.map((tool) => (
            <Link
              key={tool.to}
              to={tool.to}
              onClick={() => setIsOpen(false)}
              role="menuitem"
              className="flex items-start gap-3 p-3 rounded-sm hover:bg-surface-low transition-colors group"
            >
              <Icon name={tool.icon} className="w-5 h-5 text-gold-dim shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="font-sans text-sm font-medium text-ink group-hover:text-gold-dim">
                  {tool.title}
                </div>
                <div className="font-sans text-xs text-muted mt-0.5">{tool.description}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
