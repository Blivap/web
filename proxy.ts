import { NextRequest, NextResponse } from "next/server";
import { publicRoutes, routes } from "@/config/routes";
import { isJwtExpired } from "@/lib/auth/isJwtExpired";

const PUBLIC_ROUTES: string[] = [...publicRoutes];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_ROUTES.includes(pathname);
}

function clearAuthCookie(response: NextResponse) {
  response.cookies.set("auth_token", "", {
    path: "/",
    maxAge: 0,
  });
  return response;
}

function redirectToLogin(request: NextRequest, clearCookie: boolean) {
  const response = NextResponse.redirect(new URL(routes.login, request.url));
  if (clearCookie) clearAuthCookie(response);
  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const rawToken = request.cookies.get("auth_token")?.value ?? null;
  const tokenExpired = Boolean(rawToken && isJwtExpired(rawToken));
  const hasValidSession = Boolean(rawToken) && !tokenExpired;

  const publicPath = isPublicPath(pathname);

  // Stale JWT cookie: drop it so the client does not keep treating the session as live
  if (tokenExpired && publicPath) {
    const response = NextResponse.next();
    clearAuthCookie(response);
    return response;
  }

  // Valid session on auth/marketing public pages → app home
  if (publicPath && hasValidSession) {
    return NextResponse.redirect(new URL(routes.overview, request.url));
  }

  // Protected pages require a non-expired cookie; otherwise go to login
  if (!publicPath && !hasValidSession) {
    return redirectToLogin(request, tokenExpired || Boolean(rawToken));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply middleware to all routes except API, static assets, public images, icons, and logo
    "/((?!api|_next/static|_next/image|images|icons|logo|favicon.ico|robots.txt|sitemap.xml|manifest.json).*)",
  ],
};
