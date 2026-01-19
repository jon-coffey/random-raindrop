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
