/* global document */
import { useEffect, useRef, useState } from 'react';
import Icon from '../atoms/Icon';
import { useClickOutside } from '../Header';

export default function HelpHint({ text }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useClickOutside(wrapperRef, () => setIsOpen(false));

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <span className="relative inline-flex align-middle" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Más información"
        className="text-gold-dim hover:text-gold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm"
      >
        <Icon name="helpCircle" className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Información"
          className="absolute top-full left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 mt-2 w-72 max-w-[calc(100vw-2rem)] sm:max-w-[280px] z-50 bg-surface border border-gold/18 rounded-sm shadow-lg p-3"
        >
          <div className="flex justify-between items-start gap-2">
            <p className="font-sans text-sm text-ink leading-relaxed">{text}</p>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar"
              className="text-muted hover:text-ink shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm"
            >
              <Icon name="x" className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </span>
  );
}
