import { NextRequest, NextResponse } from "next/server";

const PROTECTED = ["/dashboard", "/applications", "/drivers", "/documents"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (!isProtected) return NextResponse.next();

  const auth = request.cookies.get("pt-admin-auth")?.value;
  if (auth === "1") return NextResponse.next();

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/applications/:path*", "/drivers/:path*", "/documents/:path*"],
};
