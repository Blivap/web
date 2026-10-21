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
import {
  getPostAuthRedirect,
  loginWithReturn,
} from "@/lib/navigation/authRedirect";

const PUBLIC_ROUTES: string[] = [...publicRoutes];

const AUTH_ENTRY_PATHS = new Set<string>([
  routes.login,
  routes.register,
  routes.verifyEmail,
  routes.forgotPassword,
  routes.resetPassword,
  routes.selectAvatar,
]);

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

  // Verification links must open with ?token= even when the session is gone.
  // Logged-in people stay on the page too; AuthChecker sends verified users on.
  if (pathname === routes.verifyEmail) {
    if (tokenExpired) {
      const response = NextResponse.next();
      clearAuthCookie(response);
      return response;
    }
    return NextResponse.next();
  }

  // Stale JWT cookie: drop it so the client does not keep treating the session as live
  if (tokenExpired && publicPath) {
    const response = NextResponse.next();
    clearAuthCookie(response);
    return response;
  }

  // Valid session on public pages → leave marketing/auth entry for the app.
  // Auth hops honor `dn` so post-login return destinations are not dropped.
  // Keep not-found reachable so 404 UI still works while logged in.
  if (publicPath && hasValidSession && !isNotFoundPath(pathname)) {
    const destination = AUTH_ENTRY_PATHS.has(pathname)
      ? getPostAuthRedirect(request.nextUrl.searchParams)
      : routes.overview;
    return NextResponse.redirect(new URL(destination, request.url));
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
    "/((?!api|_next/static|_next/image|images|icons|logo|bimi|blivap-bimi.svg|favicon.ico|robots.txt|sitemap.xml|manifest.json).*)",
  ],
};
