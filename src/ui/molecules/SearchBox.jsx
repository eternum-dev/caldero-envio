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

  const handleClear = () => {
    setValue('');
    setShowSuggestions(false);
    setFocusedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="bg-surface-2 border border-gold/18 rounded-sm flex items-center gap-2 px-3.5 py-2.5">
        <Icon name="search" className="w-4 h-4 text-gold shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
        />
        {value.length > 0 && !isSearching && (
          <button
            type="button"
            onClick={handleClear}
            className="text-muted hover:text-ink transition-colors"
          >
            <Icon name="x" className="w-4 h-4" />
          </button>
        )}
        {isSearching && (
          <div data-testid="search-spinner" className="animate-spin h-4 w-4 border-2 border-gold/20 border-t-gold rounded-full shrink-0" />
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-surface border border-gold/18 rounded-sm max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`px-3.5 py-2.5 hover:bg-surface-tint cursor-pointer text-sm text-ink border-b border-gold/18 last:border-b-0 ${
                index === focusedIndex ? 'bg-surface-tint' : ''
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
