import { NextResponse } from "next/server";
import { getRequestBaseUrl } from "@/lib/baseUrl";

export async function GET(req: Request) {
  const derived = getRequestBaseUrl(req);

  return NextResponse.json({
    appBaseUrlEnv: process.env.APP_BASE_URL ?? null,
    derivedBaseUrl: derived,
    headers: {
      host: req.headers.get("host"),
      xForwardedHost: req.headers.get("x-forwarded-host"),
      xForwardedProto: req.headers.get("x-forwarded-proto"),
    },
  });
}
