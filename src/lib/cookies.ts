export function parseCookieHeader(cookieHeader: string | null) {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;

  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const [rawKey, ...rest] = part.trim().split("=");
    if (!rawKey) continue;
    const key = rawKey;
    const value = rest.join("=");
    out[key] = decodeURIComponent(value ?? "");
  }

  return out;
}

export function getCookie(
  cookieHeader: string | null,
  name: string
): string | null {
  const cookies = parseCookieHeader(cookieHeader);
  const v = cookies[name];
  return typeof v === "string" && v.length ? v : null;
}
