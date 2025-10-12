/**
 * Date and time formatting and manipulation functions.
 */

/**
 * Format a date to a human-readable string.
 */
export function formatDate(date: Date | string | number, locale = "en-US"): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

/**
 * Format a date to a short string.
 */
export function formatDateShort(date: Date | string | number, locale = "en-US"): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/**
 * Format a date with time.
 */
export function formatDateTime(date: Date | string | number, locale = "en-US"): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Get relative time string.
 */
export function formatRelativeTime(date: Date | string | number, locale = "en-US"): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (diffSec < 60) return rtf.format(-diffSec, "second");
  if (diffMin < 60) return rtf.format(-diffMin, "minute");
  if (diffHour < 24) return rtf.format(-diffHour, "hour");
  if (diffDay < 7) return rtf.format(-diffDay, "day");
  if (diffDay < 30) return rtf.format(-Math.floor(diffDay / 7), "week");
  if (diffDay < 365) return rtf.format(-Math.floor(diffDay / 30), "month");
  return rtf.format(-Math.floor(diffDay / 365), "year");
}

/**
 * Check if a date is today.
 */
export function isToday(date: Date | string | number): boolean {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date is in the past.
 */
export function isPast(date: Date | string | number): boolean {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return d < new Date();
}

/**
 * Check if a date is in the future.
 */
export function isFuture(date: Date | string | number): boolean {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return d > new Date();
}
