import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // Admin routes - require ADMIN, MANAGER, or STAFF role
  if (pathname.startsWith("/admin")) {
    if (!token) {
      const signInUrl = new URL("/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    const userRole = token.role as string;
    const allowedRoles = ["ADMIN", "MANAGER", "STAFF"];

    if (!allowedRoles.includes(userRole)) {
      // Redirect non-admin users to home page
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Account routes - require authentication
  if (pathname.startsWith("/account")) {
    if (!token) {
      const signInUrl = new URL("/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Auth routes - redirect authenticated users away from signin/register
  if (pathname.startsWith("/signin") || pathname.startsWith("/register")) {
    if (token) {
      const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");

      // If there's a callback URL, redirect there
      if (callbackUrl) {
        return NextResponse.redirect(new URL(callbackUrl, request.url));
      }

      // Otherwise redirect based on role
      const userRole = token.role as string;
      if (["ADMIN", "MANAGER", "STAFF"].includes(userRole)) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.redirect(new URL("/account", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/signin",
    "/register",
  ],
};
