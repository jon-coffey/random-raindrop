import { NextResponse } from "next/server";
import { getEffectiveBaseUrl, getRequestBaseUrl } from "@/lib/baseUrl";

export async function GET(req: Request) {
  const derived = getRequestBaseUrl(req);
  const effective = getEffectiveBaseUrl(req);

  return NextResponse.json({
    appBaseUrlEnv: process.env.APP_BASE_URL ?? null,
    derivedBaseUrl: derived,
    effectiveBaseUrl: effective,
    headers: {
      host: req.headers.get("host"),
      xForwardedHost: req.headers.get("x-forwarded-host"),
      xForwardedProto: req.headers.get("x-forwarded-proto"),
    },
  });
}
