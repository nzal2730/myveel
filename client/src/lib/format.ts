export const CURRENCY_SYMBOL = '₹';

export const currencySymbol = (currency?: string | null) => {
  if (!currency) return CURRENCY_SYMBOL;
  const cleaned = currency.trim();
  if (cleaned === '₹' || cleaned === 'INR' || cleaned === 'Rs' || cleaned === 'Rs.') return '₹';
  if (cleaned === '$' || cleaned === 'USD') return '$';
  if (cleaned === '€' || cleaned === 'EUR') return '€';
  if (cleaned === '£' || cleaned === 'GBP') return '£';
  if (cleaned === 'AED') return 'AED ';
  return CURRENCY_SYMBOL;
};

export const formatCurrency = (value?: number | null, currency?: string | null): string => {
  const amount = Number(value || 0);
  const symbol = currencySymbol(currency);
  const formatted = amount.toLocaleString('en-IN', {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formatted}`;
};

export const formatNumber = (value?: number | null): string =>
  Number(value || 0).toLocaleString('en-IN');

export const formatDate = (value?: string | Date | null, withTime = false): string => {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
};

export const formatMonth = (value?: string | Date | null): string => {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
};

export const toInputDate = (value?: string | Date | null): string => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const todayInput = (): string => toInputDate(new Date());

export const daysUntil = (value?: string | Date | null): number => {
  if (!value) return 0;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 0;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};

export type ExpiryTone = 'success' | 'warning' | 'danger' | 'neutral';

export const getExpiryInfo = (
  value?: string | Date | null
): { label: string; tone: ExpiryTone; days: number } => {
  if (!value) return { label: 'Not set', tone: 'neutral', days: 0 };
  const days = daysUntil(value);
  if (days < 0) return { label: `Expired ${Math.abs(days)}d ago`, tone: 'danger', days };
  if (days === 0) return { label: 'Expires today', tone: 'danger', days };
  if (days <= 30) return { label: `Expires in ${days}d`, tone: 'warning', days };
  return { label: `Valid · ${days}d left`, tone: 'success', days };
};

export const capitalise = (value?: string | null): string => {
  if (!value) return '';
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const initials = (name?: string | null): string => {
  if (!name) return 'MV';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
};

export const relativeTime = (value?: string | Date | null): string => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
};
