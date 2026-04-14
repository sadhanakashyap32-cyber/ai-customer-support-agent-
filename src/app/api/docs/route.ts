import { NextResponse } from "next/server";
import { getUploadedDocs } from "@/lib/vector-store";

// Add unstable_noStore or standard Next.js dynamic routing to prevent caching.
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const docs = getUploadedDocs();
    return NextResponse.json(docs);
  } catch (err) {
    console.error("Get Docs Error:", err);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}
