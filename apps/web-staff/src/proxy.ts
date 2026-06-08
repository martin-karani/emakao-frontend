import { NextRequest, NextResponse } from "next/server";

/**
 * Public routes — accessible WITHOUT a session token.
 * Authenticated users visiting these are redirected to /dashboard.
 */
const PUBLIC_PATHS = [
  "/login",
  "/forgot-password",
  "/reset-password",
  "/accept-invite",
];

/**
 * Path prefixes that bypass the proxy entirely
 * (Next.js internals, API routes, and static assets).
 */
const ALWAYS_ALLOW_PREFIXES = ["/_next/", "/api/", "/favicon"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

function isAlwaysAllowed(pathname: string): boolean {
  return ALWAYS_ALLOW_PREFIXES.some((p) => pathname.startsWith(p));
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── 1. Never touch Next.js internals / API routes / static assets ──────────
  if (isAlwaysAllowed(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get("emakao_auth_token");
  const activeAgencySlug = req.cookies.get("active_agency_slug")?.value;
  const isAuthenticated = Boolean(token?.value);

  // ── 2. Authenticated user hitting a public (auth) page → go to dashboard ──
  if (isAuthenticated && isPublicPath(pathname)) {
    const dashboardUrl = req.nextUrl.clone();
    dashboardUrl.pathname = activeAgencySlug
      ? `/${activeAgencySlug}/dashboard`
      : "/login";
    dashboardUrl.search = "";
    return NextResponse.redirect(dashboardUrl);
  }

  // ── 3. Unauthenticated user hitting a protected page → go to login ─────────
  if (!isAuthenticated && !isPublicPath(pathname)) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    // Preserve the originally-requested path so we can redirect back after login
    if (pathname !== "/") {
      loginUrl.searchParams.set("next", pathname);
    } else {
      loginUrl.searchParams.delete("next");
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Run on every route EXCEPT:
   *   - Next.js static chunks  (_next/static)
   *   - Optimised images       (_next/image)
   *   - favicon
   *   - Common image/font file extensions
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)",
  ],
};
