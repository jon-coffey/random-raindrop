import { cookies } from "next/headers";

export async function getRaindropTokenFromRequest(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const fromHeader = auth.replace(/^Bearer\s+/i, "").trim();
  if (fromHeader) return fromHeader;

  const cookieStore = await cookies();
  const fromCookie = cookieStore.get("rd_access")?.value;
  return fromCookie ?? "";
}
