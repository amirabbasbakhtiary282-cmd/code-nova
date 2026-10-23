/**
 * Local-timezone day (YYYY-MM-DD).
 * `toISOString()` is UTC-based; for UTC+3:30 users it records "yesterday"
 * between 00:00 and 03:30 local time, which corrupts streaks and
 * learning-day statistics on both client and server.
 */
export function localDayISO(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
