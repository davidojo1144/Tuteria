import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const base = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://localhost:8000";
  const endpoint = `${base}/api/workflows/send-mail`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
