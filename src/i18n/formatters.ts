import { Language } from './types';

const LOCALE_MAP: Record<Language, string> = {
  en: 'en-US',
  hi: 'hi-IN',
  mr: 'mr-IN',
};

export function getIntlLocale(language: Language): string {
  return LOCALE_MAP[language] || 'en-US';
}

/**
 * Format numeric values with language-specific thousands grouping
 */
export function formatNumber(
  value: number,
  language: Language = 'en',
  minimumFractionDigits: number = 0,
  maximumFractionDigits: number = 2
): string {
  if (isNaN(value)) return '0';
  const locale = getIntlLocale(language);
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
}

/**
 * Format kilowatt-hour quantities with appropriate suffix and locale formatting
 */
export function formatKwh(value: number, language: Language = 'en', decimals: number = 1): string {
  return `${formatNumber(value, language, decimals, decimals)} kWh`;
}

/**
 * Format monetary currency (USD) with locale formatting
 */
export function formatCurrency(
  value: number,
  language: Language = 'en',
  decimals: number = 2
): string {
  const formatted = formatNumber(value, language, decimals, decimals);
  return `$${formatted}`;
}

/**
 * Format percentage
 */
export function formatPercent(value: number, language: Language = 'en', decimals: number = 0): string {
  return `${formatNumber(value, language, decimals, decimals)}%`;
}

/**
 * Format timestamp into localized date/time
 */
export function formatDateTime(
  timestamp: string | number | Date,
  language: Language = 'en',
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return String(timestamp);
    const locale = getIntlLocale(language);
    const defaultOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      ...options,
    };
    return new Intl.DateTimeFormat(locale, defaultOptions).format(date);
  } catch {
    return String(timestamp);
  }
}

/**
 * Format time only
 */
export function formatTime(
  timestamp: string | number | Date,
  language: Language = 'en'
): string {
  return formatDateTime(timestamp, language, {
    hour: '2-digit',
    minute: '2-digit',
    month: undefined,
    day: undefined,
  });
}
