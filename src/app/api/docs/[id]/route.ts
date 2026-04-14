import { NextResponse } from "next/server";
import { deleteUploadedDoc } from "@/lib/vector-store";

export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    if (!id) {
      return NextResponse.json({ error: "No document ID provided" }, { status: 400 });
    }

    deleteUploadedDoc(id);

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("Delete Error:", err);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
