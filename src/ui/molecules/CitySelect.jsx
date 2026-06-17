import { useState, useRef, useEffect } from 'react';
import Label from '../atoms/Label';
import Icon from '../atoms/Icon';
import { getCitiesByCountry } from '../../services/mapService';

export default function CitySelect({
  value = null,
  onChange,
  country,
  label = 'Ciudad',
  error,
  className = '',
}) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch cities when country changes
  useEffect(() => {
    if (!country) {
      setCities([]);
      return;
    }

    const fetchCities = async () => {
      setLoading(true);
      try {
        const results = await getCitiesByCountry(country);
        setCities(results);
      } catch (err) {
        console.error('Error fetching cities:', err);
        setCities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, [country]);

  const filteredCities = search
    ? cities.filter(city => city.name.toLowerCase().includes(search.toLowerCase()))
    : cities;

  const selectedCity = value?.name
    ? cities.find(c => c.name === value.name)
    : null;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (city) => {
    // Return full city object with name, center, bbox, population
    onChange({
      name: city.name,
      fullName: city.fullName,
      center: city.center,
      bbox: city.bbox,
      population: city.population ?? 0,
    });
    setIsOpen(false);
    setSearch('');
  };

  const handleOpen = () => {
    if (!country) return;
    setIsOpen(true);
    inputRef.current?.focus();
  };

  return (
    <div className={className} ref={containerRef}>
      <Label className="mb-1.5">{label}</Label>
      <div className="relative">
        <button
          type="button"
          onClick={handleOpen}
          disabled={!country}
          className="w-full bg-surface-2 border border-gold/18 rounded-sm px-3.5 py-2.5 pr-10 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-gold/35 transition-colors cursor-pointer text-left disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="text-muted">Cargando ciudades...</span>
          ) : selectedCity ? (
            <span className="text-ink">{selectedCity.name}</span>
          ) : (
            <span className="text-muted">
              {country ? 'Seleccionar ciudad' : 'Selecciona un país primero'}
            </span>
          )}
        </button>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
          <Icon name="chevronDown" className="w-4 h-4" />
        </span>

        {isOpen && country && (
          <div className="absolute z-50 w-full mt-1 bg-surface border border-gold/18 rounded-sm overflow-hidden">
            <div className="p-2 border-b border-gold/18">
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar ciudad..."
                className="w-full bg-surface-2 border border-gold/18 rounded-sm px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-gold/35"
              />
            </div>
            <ul className="max-h-60 overflow-y-auto">
              {loading ? (
                <li className="px-3.5 py-2 text-muted text-sm">Cargando...</li>
              ) : filteredCities.length === 0 ? (
                <li className="px-3.5 py-2 text-muted text-sm">Sin resultados</li>
              ) : (
                filteredCities.map(city => (
                  <li key={city.name}>
                    <button
                      type="button"
                      onClick={() => handleSelect(city)}
                      className="w-full px-3.5 py-2 text-left text-sm text-ink hover:bg-surface-tint transition-colors"
                    >
                      {city.name}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
      {error && <span className="text-[11px] text-danger mt-1 block">{error}</span>}
    </div>
  );
}
