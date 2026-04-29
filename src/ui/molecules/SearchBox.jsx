import { useState, useRef, useEffect } from 'react';
import Icon from '../atoms/Icon';

export default function SearchBox({
  placeholder = 'Buscar dirección...',
  onSearch,
  onSuggest,
  suggestions = [],
  debounceMs = 300,
  loading = false,
  className = '',
}) {
  const [value, setValue] = useState('');
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const timeoutRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (value.trim()) {
      setIsDebouncing(true);
      timeoutRef.current = setTimeout(() => {
        onSuggest?.(value);
        setIsDebouncing(false);
      }, debounceMs);
    } else {
      setIsDebouncing(false);
      setShowSuggestions(false);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [value, debounceMs, onSuggest]);

  useEffect(() => {
    const handleClickOutside = event => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  }, [suggestions]);

  const isSearching = isDebouncing;

  const handleSuggestionClick = suggestion => {
    setValue(suggestion.placeName);
    setShowSuggestions(false);
    onSearch?.(suggestion.placeName, suggestion.coordinates);
  };

  return (
    <div ref={containerRef} className={`relative mb-2 ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Icon name="search" className="h-5 w-5 text-primary-fixed_dim" />
      </div>
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-3 bg-surface-high rounded-md text-white placeholder:text-primary-fixed_dim focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
      {isSearching && (
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
          <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-surface border border-surface-high shadow-xl rounded-md max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-4 py-3 hover:bg-primary/20 cursor-pointer text-on_surface text-sm border-b border-surface-high last:border-b-0"
            >
              {suggestion.placeName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}