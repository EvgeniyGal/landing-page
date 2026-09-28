import { NextResponse } from "next/server";
import { applyCorsHeaders } from "@/lib/api/cors";
import { openApiDocument } from "@/lib/api/openapi";

export async function GET() {
  return applyCorsHeaders(
    NextResponse.json(openApiDocument, {
      headers: {
        "Cache-Control": "public, max-age=60",
      },
    }),
  );
}

export async function OPTIONS() {
  return applyCorsHeaders(new NextResponse(null, { status: 204 }));
}
