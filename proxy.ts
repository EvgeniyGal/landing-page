import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export const proxy = auth((req) => {
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
      return NextResponse.redirect(new URL("/account", req.nextUrl.origin));
    }
  }

  if (pathname === "/login" && isLoggedIn) {
    const dest = role === "admin" ? "/admin" : "/account";
    return NextResponse.redirect(new URL(dest, req.nextUrl.origin));
  }

  return NextResponse.next();
});

export default proxy;

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
