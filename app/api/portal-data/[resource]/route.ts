import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifySessionToken } from "../../../../lib/session";
import {
  createPortalRecord,
  isPortalResource,
  listPortalRecords,
} from "../../../../lib/portal-data";
import { databaseErrorResponse } from "../../../../lib/database-response";
import { isRecordInput } from "../../../../lib/record-validation";

type RouteContext = { params: Promise<{ resource: string }> };

async function getPortalSession() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get("edunusa_session")?.value);
  if (session?.role !== "Siswa" && session?.role !== "Guru") return null;
  return session;
}

export async function GET(_request: Request, context: RouteContext) {
  const [{ resource }, session] = await Promise.all([
    context.params,
    getPortalSession(),
  ]);
  if (!session) {
    return NextResponse.json(
      { error: "Akses portal ditolak." },
      { status: 403 },
    );
  }
  if (!isPortalResource(resource)) {
    return NextResponse.json(
      { error: "Data portal tidak ditemukan." },
      { status: 404 },
    );
  }
  try {
    return NextResponse.json(await listPortalRecords(resource, session));
  } catch (error) {
    return databaseErrorResponse(error, `list portal ${resource}`);
  }
}

export async function POST(request: Request, context: RouteContext) {
  const [{ resource }, session] = await Promise.all([
    context.params,
    getPortalSession(),
  ]);
  if (!session || session.role !== "Guru") {
    return NextResponse.json(
      { error: "Hanya guru yang dapat mengubah data." },
      { status: 403 },
    );
  }
  if (resource !== "attendance" && resource !== "grades") {
    return NextResponse.json(
      { error: "Data ini hanya dapat dibaca." },
      { status: 405 },
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
    const result = await createPortalRecord(
      resource,
      session,
      input,
    );
    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 },
      );
    }
    return NextResponse.json(result.record, { status: 201 });
  } catch (error) {
    return databaseErrorResponse(error, `create portal ${resource}`);
  }
}
