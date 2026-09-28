import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";
import {
  applyCorsHeaders,
  corsPreflightResponse,
  isApiCorsPath,
} from "./lib/api/cors";

const { auth } = NextAuth(authConfig);

const authProxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = Boolean(req.auth);
  const role = req.auth?.user?.role;

  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      const login = new URL("/login", req.nextUrl.origin);
      login.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(login);
    }
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/app", req.nextUrl.origin));
    }
  }

  if (pathname.startsWith("/app") || pathname === "/account") {
    if (!isLoggedIn) {
      const login = new URL("/login", req.nextUrl.origin);
      login.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(login);
    }
  }

  if (pathname === "/login" && isLoggedIn) {
    const dest = role === "admin" ? "/admin" : "/app";
    return NextResponse.redirect(new URL(dest, req.nextUrl.origin));
  }

  return NextResponse.next();
});

export default function proxy(...args: Parameters<typeof authProxy>) {
  const req = args[0];
  const pathname = req.nextUrl.pathname;

  if (isApiCorsPath(pathname)) {
    if (req.method === "OPTIONS") {
      return corsPreflightResponse();
    }
    const response = NextResponse.next();
    return applyCorsHeaders(response);
  }

  return authProxy(...args);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/login",
    "/app/:path*",
    "/account",
    "/api/v1/:path*",
    "/api/audio/:path*",
  ],
};
