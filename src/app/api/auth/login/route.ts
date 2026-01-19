import { NextResponse } from "next/server";
import { getEffectiveBaseUrl } from "@/lib/baseUrl";

export async function GET(req: Request) {
  const baseUrl = getEffectiveBaseUrl(req);
  const clientId = process.env.RAINDROP_CLIENT_ID;

  if (!baseUrl || !clientId) {
    return NextResponse.json(
      { error: "Missing RAINDROP_CLIENT_ID (and APP_BASE_URL if host headers are not available)" },
      { status: 500 }
    );
  }

  const redirectUri = `${baseUrl.replace(/\/$/, "")}/api/auth/callback`;
  const url = new URL("https://raindrop.io/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);

  return NextResponse.redirect(url.toString());
}
