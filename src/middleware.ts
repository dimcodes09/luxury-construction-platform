import { NextResponse, type NextRequest } from "next/server";

/* NFR-SEC-11 — "Admin routes protected by middleware; every Server Action
 * independently re-checks role."
 *
 * This is the FIRST of those two layers and deliberately the weaker one: it
 * only checks that a session cookie exists, because middleware runs on the edge
 * where the Mongo-backed session cannot be verified. It exists to bounce
 * signed-out visitors straight to the login page rather than letting them load
 * an admin shell that would then fail.
 *
 * The real boundary is requireCapability() inside each page and action. Nothing
 * here is trusted for authorisation.
 */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The login page and the auth endpoints must stay reachable when signed out.
  if (
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const hasSession = request.cookies
      .getAll()
      .some(
        (cookie) =>
          cookie.name.startsWith("zyvora.session") ||
          cookie.name.startsWith("zyvora.session_token"),
      );

    if (!hasSession) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
