import { NextResponse } from "next/server";
import {
  createRecord,
  isAcademicResource,
  listRecords,
  type AcademicRecord,
} from "@/lib/academic-data";
import { validateAcademicRecord } from "@/lib/academic-validation";
import { isRecordInput } from "@/lib/record-validation";

type RouteContext = { params: Promise<{ resource: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { resource } = await context.params;
  if (!isAcademicResource(resource)) {
    return NextResponse.json(
      { error: "Resource tidak ditemukan" },
      { status: 404 },
    );
  }

  try {
    return NextResponse.json(await listRecords(resource));
  } catch (error) {
    console.error(`Failed to list academic ${resource}:`, error);
    return NextResponse.json(
      { error: "Data akademik tidak dapat dimuat dari database." },
      { status: 503 },
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  const { resource } = await context.params;
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
    const validationError = await validateAcademicRecord(resource, input);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }
    const record = await createRecord(
      resource,
      input as Omit<AcademicRecord, "id">,
    );
    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error(`Failed to create academic ${resource}:`, error);
    return NextResponse.json(
      { error: "Data akademik tidak dapat disimpan ke database." },
      { status: 503 },
    );
  }
}
