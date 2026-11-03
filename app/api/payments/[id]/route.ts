import { NextResponse } from "next/server";
import {
  deletePayment,
  getPaymentById,
  updatePayment,
  type StudentPayment,
} from "@/lib/db";
import { databaseErrorResponse } from "@/lib/database-response";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const payment = await getPaymentById(id);
    if (!payment) {
      return NextResponse.json(
        { error: "Data pembayaran tidak ditemukan." },
        { status: 404 },
      );
    }
    return NextResponse.json(payment);
  } catch (error) {
    return databaseErrorResponse(error, "get payment by id");
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const body = (await request.json()) as Partial<StudentPayment>;
    const updated = await updatePayment(id, body);
    if (!updated) {
      return NextResponse.json(
        { error: "Data pembayaran tidak ditemukan." },
        { status: 404 },
      );
    }
    return NextResponse.json(updated);
  } catch (error) {
    return databaseErrorResponse(error, "update student payment");
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const success = await deletePayment(id);
    if (!success) {
      return NextResponse.json(
        { error: "Data pembayaran tidak ditemukan atau sudah dihapus." },
        { status: 404 },
      );
    }
    return NextResponse.json({ message: "Data pembayaran berhasil dihapus." });
  } catch (error) {
    return databaseErrorResponse(error, "delete student payment");
  }
}

