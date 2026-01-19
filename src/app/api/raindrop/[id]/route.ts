import { NextResponse } from "next/server";
import { raindropFetch } from "@/lib/raindrop";
import { getRaindropTokenFromRequest } from "@/lib/raindropAuth";

type DeleteResponse = {
  result: boolean;
};

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getRaindropTokenFromRequest(req);

  if (!token) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  const { id } = await params;
  const raindropId = Number.parseInt(id, 10);

  if (!Number.isFinite(raindropId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const data = await raindropFetch<DeleteResponse>(`/raindrop/${raindropId}`, token, {
      method: "DELETE",
    });

    return NextResponse.json({ result: data.result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
