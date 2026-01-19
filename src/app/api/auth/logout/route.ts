import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ result: true });
  res.cookies.set("rd_access", "", { path: "/", maxAge: 0 });
  res.cookies.set("rd_refresh", "", { path: "/", maxAge: 0 });
  return res;
}
