import { useEffect } from 'react';

export function useClickOutside(ref, callback) {
  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const handler = event => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, callback]);
}