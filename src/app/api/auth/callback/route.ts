import { NextResponse } from "next/server";

type TokenResponse =
  | {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      token_type: string;
    }
  | { error: string };

export async function GET(req: Request) {
  const baseUrl = process.env.APP_BASE_URL;
  const clientId = process.env.RAINDROP_CLIENT_ID;
  const clientSecret = process.env.RAINDROP_CLIENT_SECRET;

  if (!baseUrl || !clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Missing APP_BASE_URL or RAINDROP_CLIENT_ID or RAINDROP_CLIENT_SECRET" },
      { status: 500 }
    );
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`${baseUrl.replace(/\/$/, "")}/?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const redirectUri = `${baseUrl.replace(/\/$/, "")}/api/auth/callback`;

  const tokenRes = await fetch("https://raindrop.io/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }),
  });

  const data = (await tokenRes.json().catch(() => null)) as TokenResponse | null;

  if (!tokenRes.ok || !data || "error" in data) {
    const message = data && "error" in data ? data.error : "token_exchange_failed";
    return NextResponse.redirect(
      `${baseUrl.replace(/\/$/, "")}/?error=${encodeURIComponent(message)}`
    );
  }

  const res = NextResponse.redirect(`${baseUrl.replace(/\/$/, "")}/`);
  const secure = baseUrl.startsWith("https://");

  res.cookies.set("rd_access", data.access_token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: Math.max(0, data.expires_in),
  });

  res.cookies.set("rd_refresh", data.refresh_token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return res;
}
