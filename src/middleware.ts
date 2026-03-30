import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/", "/pricing", "/about", "/login", "/signup", "/forgot-password", "/reset-password"];
const authRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await auth();

  // Handle invite tokens
  if (pathname.startsWith("/invite/")) {
    if (!session) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, request.url));
    }
    return NextResponse.next();
  }

  // Redirect authenticated users away from auth pages
  if (authRoutes.some((route) => pathname === route)) {
    if (session) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
    return NextResponse.next();
  }

  // Protect /app/* routes
  if (pathname.startsWith("/app/")) {
    if (!session) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, request.url));
    }
    return NextResponse.next();
  }

  // Protect /onboarding
  if (pathname.startsWith("/onboarding")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
