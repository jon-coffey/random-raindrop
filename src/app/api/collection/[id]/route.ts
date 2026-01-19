import { NextResponse } from "next/server";
import { raindropFetch, type RaindropCollection } from "@/lib/raindrop";

type CollectionResponse = {
  result: boolean;
  item: RaindropCollection;
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    return NextResponse.json(
      { error: "Missing Authorization header" },
      { status: 401 }
    );
  }

  const { id } = await params;
  const collectionId = Number.parseInt(id, 10);

  if (!Number.isFinite(collectionId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const data = await raindropFetch<CollectionResponse>(
      `/collection/${collectionId}`,
      token
    );
    return NextResponse.json({ collection: data.item });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
