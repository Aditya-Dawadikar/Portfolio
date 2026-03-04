import { NextResponse } from "next/server";
import { fetchWithLocalCache } from "../../../lib/readmeCache";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    const text = await fetchWithLocalCache(url, 30);
    return new NextResponse(text, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
