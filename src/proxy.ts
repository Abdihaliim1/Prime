import { NextRequest, NextResponse } from "next/server";
import { ADMIN_AUTH_COOKIE, verifyAdminToken } from "@/lib/auth";

const PROTECTED = ["/dashboard", "/applications", "/drivers", "/documents"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (!isProtected) return NextResponse.next();

  const auth = request.cookies.get(ADMIN_AUTH_COOKIE)?.value;
  if (await verifyAdminToken(auth)) return NextResponse.next();

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/applications/:path*", "/drivers/:path*", "/documents/:path*"],
};
