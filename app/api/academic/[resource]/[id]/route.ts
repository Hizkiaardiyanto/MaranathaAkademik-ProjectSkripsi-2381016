import { NextResponse } from "next/server";
import {
  deleteRecord,
  isAcademicResource,
  updateRecord,
} from "@/lib/academic-data";
import { validateAcademicRecord } from "@/lib/academic-validation";
import { isRecordInput } from "@/lib/record-validation";

type RouteContext = {
  params: Promise<{ resource: string; id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const { resource, id } = await context.params;
  if (!isAcademicResource(resource)) {
    return NextResponse.json(
      { error: "Resource tidak ditemukan" },
      { status: 404 },
    );
  }

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Format data tidak valid." },
      { status: 400 },
    );
  }
  if (!isRecordInput(input)) {
    return NextResponse.json(
      { error: "Data yang dikirim tidak valid." },
      { status: 400 },
    );
  }

  try {
    const validationError = await validateAcademicRecord(resource, input, id);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }
    const record = await updateRecord(resource, id, input);
    if (!record) {
      return NextResponse.json(
        { error: "Data tidak ditemukan" },
        { status: 404 },
      );
    }
    return NextResponse.json(record);
  } catch (error) {
    console.error(`Failed to update academic ${resource}/${id}:`, error);
    return NextResponse.json(
      { error: "Data akademik tidak dapat disimpan ke database." },
      { status: 503 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { resource, id } = await context.params;
  if (!isAcademicResource(resource)) {
    return NextResponse.json(
      { error: "Resource tidak ditemukan" },
      { status: 404 },
    );
  }

  try {
    if (!(await deleteRecord(resource, id))) {
      return NextResponse.json(
        { error: "Data tidak ditemukan" },
        { status: 404 },
      );
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Failed to delete academic ${resource}/${id}:`, error);
    return NextResponse.json(
      { error: "Data akademik tidak dapat dihapus dari database." },
      { status: 503 },
    );
  }
}
