import { useState, useRef, useEffect } from 'react';
import Icon from '../atoms/Icon';

export default function SearchBox({
  placeholder = 'Buscar dirección...',
  onSearch,
  debounceMs = 300,
  className = '',
}) {
  const [value, setValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (value.trim()) {
      setIsSearching(true);
      timeoutRef.current = setTimeout(() => {
        onSearch?.(value);
        setIsSearching(false);
      }, debounceMs);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [value, debounceMs, onSearch]);

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Icon name="search" className="h-5 w-5 text-primary-fixed_dim" />
      </div>
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-3 bg-surface-container-highest rounded-md text-on_surface placeholder:text-primary-fixed_dim focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
      {isSearching && (
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
          <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      )}
    </div>
  );
}
