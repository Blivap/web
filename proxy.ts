import { NextRequest, NextResponse } from "next/server";
import {
  isNotFoundPath,
  publicRoutes,
  requiresAuth,
  routes,
} from "@/config/routes";
import { isJwtExpired } from "@/lib/auth/isJwtExpired";
import {
  AUTH_TOKEN_COOKIE,
  AUTH_TOKEN_EXPIRES_COOKIE,
  isExpiresAtPast,
} from "@/lib/auth/sessionExpiry";
import { loginWithReturn } from "@/lib/navigation/authRedirect";

const PUBLIC_ROUTES: string[] = [...publicRoutes];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_ROUTES.includes(pathname);
}

function clearAuthCookie(response: NextResponse) {
  response.cookies.set(AUTH_TOKEN_COOKIE, "", {
    path: "/",
    maxAge: 0,
  });
  response.cookies.set(AUTH_TOKEN_EXPIRES_COOKIE, "", {
    path: "/",
    maxAge: 0,
  });
  return response;
}

function redirectToLogin(request: NextRequest, clearCookie: boolean) {
  const { pathname, search } = request.nextUrl;
  const loginPath = loginWithReturn(pathname, search);
  const response = NextResponse.redirect(new URL(loginPath, request.url));
  if (clearCookie) clearAuthCookie(response);
  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const rawToken = request.cookies.get(AUTH_TOKEN_COOKIE)?.value ?? null;
  const expiresRaw =
    request.cookies.get(AUTH_TOKEN_EXPIRES_COOKIE)?.value ?? null;
  const tokenExpired =
    isExpiresAtPast(expiresRaw) || Boolean(rawToken && isJwtExpired(rawToken));
  const hasValidSession = Boolean(rawToken) && !tokenExpired;

  const publicPath = isPublicPath(pathname);

  // Stale JWT cookie: drop it so the client does not keep treating the session as live
  if (tokenExpired && publicPath) {
    const response = NextResponse.next();
    clearAuthCookie(response);
    return response;
  }

  // Valid session on auth/marketing public pages → app home
  // Keep not-found reachable so 404 UI still works while logged in.
  if (publicPath && hasValidSession && !isNotFoundPath(pathname)) {
    return NextResponse.redirect(new URL(routes.overview, request.url));
  }

  // Known protected areas require a session; unknown paths fall through to not-found
  if (requiresAuth(pathname) && !hasValidSession) {
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
