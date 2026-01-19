import { NextResponse } from "next/server";
import { raindropFetch, type RaindropCollection, type RaindropItem } from "@/lib/raindrop";
import { getRaindropTokenFromRequest } from "@/lib/raindropAuth";

type RaindropsListResponse = {
  result: boolean;
  items: RaindropItem[];
};

type CollectionResponse = {
  result: boolean;
  item: RaindropCollection;
};

function toInt(value: string | null) {
  if (!value) return null;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}

export async function GET(req: Request) {
  const token = await getRaindropTokenFromRequest(req);

  if (!token) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  const url = new URL(req.url);
  const collectionId = toInt(url.searchParams.get("collectionId"));
  const countParam = toInt(url.searchParams.get("count"));

  if (collectionId === null) {
    return NextResponse.json({ error: "Missing collectionId" }, { status: 400 });
  }

  let total = Math.max(0, countParam ?? 0);

  if (!total) {
    try {
      const meta = await raindropFetch<CollectionResponse>(
        `/collection/${collectionId}`,
        token
      );
      total = Math.max(0, meta.item.count ?? 0);
    } catch {
    }
  }

  if (!total) {
    try {
      const qs = new URLSearchParams({
        perpage: "50",
        page: "0",
      });

      const data = await raindropFetch<RaindropsListResponse>(
        `/raindrops/${collectionId}?${qs.toString()}`,
        token
      );

      const items = Array.isArray(data.items) ? data.items : [];
      const item = items.length
        ? items[Math.floor(Math.random() * items.length)]
        : null;
      return NextResponse.json({ item });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      return NextResponse.json({ error: message }, { status: 502 });
    }
  }

  const perpage = 50;
  const randomIndex = Math.floor(Math.random() * total);
  const page = Math.floor(randomIndex / perpage);
  const indexInPage = randomIndex % perpage;

  try {
    const qs = new URLSearchParams({
      perpage: String(perpage),
      page: String(page),
    });

    const data = await raindropFetch<RaindropsListResponse>(
      `/raindrops/${collectionId}?${qs.toString()}`,
      token
    );

    const items = Array.isArray(data.items) ? data.items : [];
    if (items.length === 0) {
      return NextResponse.json({ item: null });
    }

    const item =
      items[indexInPage] ??
      items[Math.floor(Math.random() * items.length)] ??
      null;
    return NextResponse.json({ item });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
