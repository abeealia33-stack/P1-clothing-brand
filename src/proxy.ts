import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Sends signed-out visitors to the login page before /admin renders.
 *
 * This is a convenience, not the lock. It only checks that a session cookie is
 * present — it cannot verify the signature here without pulling Node crypto
 * into the edge runtime. The real check is `requireAdmin()`, which every admin
 * page and every server action calls, because server actions are reachable by
 * direct POST no matter what this file says.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!request.cookies.has("bilques_admin")) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
