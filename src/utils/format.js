/**
 * Format a CLP amount as "$X.XXX" (no decimals, Chilean locale).
 * @param {number} amount
 * @returns {string}
 */
export function formatCLP(amount) {
  if (typeof amount !== 'number' || Number.isNaN(amount)) {
    return '$0';
  }

  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a timestamp as a relative date string in Spanish (Chile).
 * Supports Date, Firebase Timestamp ({ seconds, nanoseconds }), or millisecond number.
 * @param {Date | { seconds: number, nanoseconds: number } | number} timestamp
 * @returns {string}
 */
export function formatRelativeDate(timestamp) {
  const date = toDate(timestamp);
  if (!date || Number.isNaN(date.getTime())) {
    return '';
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'hace un momento';
  }

  if (diffMinutes < 60) {
    return `hace ${diffMinutes} min`;
  }

  if (diffHours < 24) {
    return `hace ${diffHours} h`;
  }

  if (diffDays === 1) {
    return 'ayer';
  }

  if (diffDays < 7) {
    return `hace ${diffDays} días`;
  }

  return date.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'short',
  });
}

function toDate(timestamp) {
  if (timestamp instanceof Date) {
    return timestamp;
  }

  if (timestamp && typeof timestamp === 'object' && typeof timestamp.seconds === 'number') {
    return new Date(timestamp.seconds * 1000);
  }

  if (typeof timestamp === 'number') {
    return new Date(timestamp);
  }

  return null;
}
