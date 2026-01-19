import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const baseUrl = process.env.APP_BASE_URL;
  const clientId = process.env.RAINDROP_CLIENT_ID;

  if (!baseUrl || !clientId) {
    return NextResponse.json(
      { error: "Missing APP_BASE_URL or RAINDROP_CLIENT_ID" },
      { status: 500 }
    );
  }

  const redirectUri = `${baseUrl.replace(/\/$/, "")}/api/auth/callback`;
  const url = new URL("https://raindrop.io/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);

  return NextResponse.redirect(url.toString());
}
