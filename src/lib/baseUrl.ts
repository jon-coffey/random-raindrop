export function getRequestBaseUrl(req: Request) {
  const url = new URL(req.url);

  const host =
    req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? url.host;

  const proto =
    req.headers.get("x-forwarded-proto") ??
    (host === "localhost" || host.startsWith("localhost:") ? "http" : url.protocol.replace(":", ""));

  if (!host) return null;

  return `${proto}://${host}`;
}

function isLocalhostBaseUrl(baseUrl: string) {
  try {
    const u = new URL(baseUrl);
    return u.hostname === "localhost" || u.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

export function getEffectiveBaseUrl(req: Request) {
  const derived = getRequestBaseUrl(req);
  const env = process.env.APP_BASE_URL ?? null;
  if (!env) return derived;

  if (derived && !isLocalhostBaseUrl(derived) && isLocalhostBaseUrl(env)) {
    return derived;
  }

  return env;
}
