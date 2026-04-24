const CACHE_PREFIX = 'caldero_address_';

export function getCachedAddress(addressText, country = 'cl') {
  const cached = localStorage.getItem(CACHE_PREFIX + country.toLowerCase() + '_' + addressText.toLowerCase());
  if (cached) {
    const data = JSON.parse(cached);
    data.fromCache = true;
    return data;
  }
  return null;
}

export function setCachedAddress(addressText, data, country = 'cl') {
  const cachedData = {
    ...data,
    text: addressText,
    cachedAt: new Date().toISOString(),
  };
  localStorage.setItem(CACHE_PREFIX + country.toLowerCase() + '_' + addressText.toLowerCase(), JSON.stringify(cachedData));
}

export function getRecentAddresses(limit = 10) {
  const addresses = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(CACHE_PREFIX)) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        addresses.push(data);
      } catch (e) {
        // ignore invalid entries
      }
    }
  }
  return addresses.sort((a, b) => new Date(b.cachedAt) - new Date(a.cachedAt)).slice(0, limit);
}

export function clearCache() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(CACHE_PREFIX)) {
      keys.push(key);
    }
  }
  keys.forEach(key => localStorage.removeItem(key));
}
