import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES: string[] = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/researchers",
  "/healthcare&professionals",
  "/working_at",
  "/donors",
  "/about",
  "/about-blood",
  "/about-donating",
  "/about-sperm",
  "/contact",
  "/education",
  "/faq",
  "/giving-blood",
  "/healthcare",
  "/news",
  "/our-expertise",
  "/research",
  "/what-we-do",
  "/not_found",
  "/not-found",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_ROUTES.includes(pathname);
}

function isVerifyEmail(pathname: string): boolean {
  return pathname === "/verify-email";
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("auth_token")?.value;
  const isAuthenticated = Boolean(token);

  const publicPath = isPublicPath(pathname);
  const verifyEmailPage = isVerifyEmail(pathname);

  // Authenticated users must not access any public route; send them to dashboard
  if (publicPath && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Unauthenticated users must not access protected pages (verify-email, dashboard, etc.)
  if (verifyEmailPage && !isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (pathname === "/dashboard" && !isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (pathname === "/select_avatar" && !isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  // Any other non-public page requires authentication
  if (!publicPath && !isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply middleware to all routes except API, static assets, public images, icons, and logo
    "/((?!api|_next/static|_next/image|images|icons|logo|favicon.ico|robots.txt|sitemap.xml|manifest.json).*)",
  ],
};
