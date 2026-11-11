/**
 * Normalize Auth.js callback values to a same-origin path. Proxy can supply an
 * internal absolute URL (for example 0.0.0.0 in a dev preview); stripping the
 * origin preserves the intended destination without allowing open redirects.
 */
export function safeCallbackPath(value: string): string {
  const fallback = "/dashboard";
  if (!value.trim() || !URL.canParse(value, "http://codenova.invalid")) return fallback;

  const target = new URL(value, "http://codenova.invalid");
  if (target.protocol !== "http:" && target.protocol !== "https:") return fallback;
  return `${target.pathname}${target.search}${target.hash}`;
}
