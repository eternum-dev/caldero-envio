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
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const timeoutRef = useRef(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const lastTypedRef = useRef('');

  // Debounced search - fires onSuggest after user stops typing
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (value.trim()) {
      setIsDebouncing(true);
      setFocusedIndex(-1);
      timeoutRef.current = setTimeout(() => {
        onSuggest?.(value);
        setIsDebouncing(false);
      }, debounceMs);
    } else {
      setIsDebouncing(false);
      setShowSuggestions(false);
      setFocusedIndex(-1);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [value, debounceMs, onSuggest]);

  // Clear dropdown when suggestions are cleared by parent
  useEffect(() => {
    if (suggestions.length === 0) {
      setShowSuggestions(false);
      setFocusedIndex(-1);
    }
  }, [suggestions]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Only show suggestions if they match what the user actually typed
  // This prevents stale suggestions from reappearing after re-renders
  useEffect(() => {
    if (suggestions.length > 0 && lastTypedRef.current === value.trim()) {
      setShowSuggestions(true);
    }
  }, [value, suggestions]);

  const isSearching = isDebouncing;

  const handleChange = e => {
    setValue(e.target.value);
    lastTypedRef.current = e.target.value;
  };

  const handleKeyDown = e => {
    if (!suggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => {
          if (prev === -1) return 0;
          return Math.min(prev + 1, suggestions.length - 1);
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (focusedIndex === -1) {
          inputRef.current?.focus();
        } else {
          setFocusedIndex(prev => prev - 1);
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && suggestions[focusedIndex]) {
          handleSuggestionClick(suggestions[focusedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setFocusedIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = suggestion => {
    setValue(suggestion.placeName);
    setShowSuggestions(false);
    setFocusedIndex(-1);
    onSearch?.(suggestion.placeName, suggestion.coordinates);
  };

  return (
    <div ref={containerRef} className={`relative mb-2 ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Icon name="search" className="h-5 w-5 text-primary-fixed_dim" />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        onKeyDown={handleKeyDown}
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
              className={`px-4 py-3 hover:bg-primary/20 cursor-pointer text-on_surface text-sm border-b border-surface-high last:border-b-0 ${
                index === focusedIndex ? 'bg-primary/20' : ''
              }`}
            >
              {suggestion.placeName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}