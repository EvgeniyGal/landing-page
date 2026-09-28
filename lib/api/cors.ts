import { NextResponse, type NextRequest } from "next/server";

export const API_CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, Accept",
  "Access-Control-Max-Age": "86400",
};

export function isApiCorsPath(pathname: string) {
  return pathname.startsWith("/api/v1") || pathname.startsWith("/api/audio");
}

export function corsPreflightResponse() {
  return new NextResponse(null, {
    status: 204,
    headers: API_CORS_HEADERS,
  });
}

export function applyCorsHeaders(response: NextResponse) {
  for (const [key, value] of Object.entries(API_CORS_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

export function withCorsJson(data: unknown, init?: ResponseInit) {
  const response = NextResponse.json(data, init);
  return applyCorsHeaders(response);
}

/** Attach CORS to an outgoing NextResponse when the request targets the mobile API. */
export function maybeCors(request: NextRequest, response: NextResponse) {
  if (isApiCorsPath(request.nextUrl.pathname)) {
    return applyCorsHeaders(response);
  }
  return response;
}
