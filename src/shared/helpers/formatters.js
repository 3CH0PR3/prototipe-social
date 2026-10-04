function parseDate(d) {
  if (!d) return null;
  if (d instanceof Date) return d;

  const directDate = new Date(d);
  if (!isNaN(directDate.getTime())) return directDate;

  // Detecta el formato DD-MM-YYYY o DD/MM/YYYY con o sin hora (ej: "18-07-2026 00:00")
  const match = String(d)
    .trim()
    .match(/^(\d{2})[-/](\d{2})[-/](\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (match) {
    const [, day, month, year, hours = '00', minutes = '00', seconds = '00'] = match;
    // Crea la fecha en formato estándar ISO: YYYY-MM-DDTHH:mm:ss
    return new Date(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}`);
  }

  return new Date(d); // Devuelve la fecha original aunque sea inválida como último recurso
}

export function formatDate(d) {
  if (!d) return '—';

  const date = parseDate(d);
  if (!date || isNaN(date.getTime())) return '—';

  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return 'hace un momento';
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;

  return date.toLocaleDateString('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function formatTime(d) {
  if (!d) return '';
  return new Date(d).toLocaleTimeString('es', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export const formatDateTime = (d) => {
  if (!d) return '//-//-//';

  // Si ya viene formateada como DD-MM-YYYY o DD/MM/YYYY la devuelve tal cual
  if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(String(d).trim())) return d;

  const date = new Date(d);
  if (isNaN(date.getTime())) return '//-//-//';

  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();

  return `${dd}-${mm}-${yyyy}`;
};

/**
 * Formato de contadores compacto para badges/stats:
 *   < 10   → número exacto
 *   10–99  → 9+
 *   100–999 → 99+
 *   1 000–9 999 → 1K, 2K…
 *   10 000+ → 9K+
 */
export function formatCount(n) {
  if (n < 10) return String(n);
  if (n < 100) return '9+';
  if (n < 1000) return '99+';
  if (n < 10000) return `${Math.floor(n / 1000)}K`;
  return '9K+';
}

export function formatCurrency(value) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000)
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (value >= 1) return `$${value.toFixed(2)}`;
  return `$${value.toFixed(4)}`;
}

export function formatPercent(value, showSign = true) {
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function formatNumber(value) {
  return value.toLocaleString('en-US');
}
