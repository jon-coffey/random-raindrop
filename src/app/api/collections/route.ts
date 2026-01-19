import { NextResponse } from "next/server";
import { raindropFetch, type RaindropCollection } from "@/lib/raindrop";

type CollectionsResponse = {
  result: boolean;
  items: RaindropCollection[];
};

export async function GET(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    return NextResponse.json(
      { error: "Missing Authorization header" },
      { status: 401 }
    );
  }

  try {
    const data = await raindropFetch<CollectionsResponse>("/collections", token);
    return NextResponse.json({ collections: data.items });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
