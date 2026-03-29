/**
 * Central path map for Blivap. Prefer importing from here instead of hard-coded strings.
 * Derived from app routes, proxy public list, sitemap, hooks, layouts, and components.
 */

export const routes = {
  home: "/",

  // Auth
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  verifyEmail: "/verify-email",

  // Marketing / content (many are “public” in middleware — see `publicRoutes`)
  bookDemo: "/book-demo",
  about: "/about",
  aboutBlood: "/about-blood",
  aboutDonating: "/about-donating",
  aboutSperm: "/about-sperm",
  contact: "/contact",
  education: "/education",
  faq: "/faq",
  givingBlood: "/giving-blood",
  healthcare: "/healthcare",
  /** Note: `&` is literal in the URL path. */
  healthcareProfessionals: "/healthcare&professionals",
  news: "/news",
  ourExpertise: "/our-expertise",
  research: "/research",
  researchers: "/researchers",
  whatWeDo: "/what-we-do",
  workingAt: "/working_at",
  waitlist: "/waitlist",

  // Legal
  privacy: "/privacy",
  terms: "/terms",
  vulnerabilityDisclosure: "/vulnerability-disclosure",

  // Error / fallback (referenced in `proxy.ts`)
  notFound: "/not_found",
  notFoundAlt: "/not-found",

  // Logged-in app shell
  overview: "/overview",
  dashboard: "/dashboard",
  selectAvatar: "/select_avatar",
  donors: "/donors",
  donorsNew: "/donors/new",
  wallet: "/wallet",
  history: "/history",
  settings: "/settings",
  verifyId: (id?: string) => `/verify-id${id ? `?donorId=${id}` : ""}`,
  scheduleAppointment: (id: string) => `/schedule-appointment?donorId=${id}`,
  // Next.js routes
  apiOg: "/api/og",
} as const;

export type Routes = typeof routes;

/** Dynamic segment: `/donors/[id]` */
export function donorDetailPath(donorId: string): string {
  return `${routes.donors}/${encodeURIComponent(donorId)}`;
}

/**
 * Paths that `proxy.ts` treats as public (unauthenticated users may view).
 * Keep in sync with middleware behaviour.
 */
export const publicRoutes: readonly string[] = [
  routes.home,
  routes.bookDemo,
  routes.login,
  routes.register,
  routes.forgotPassword,
  routes.resetPassword,
  routes.researchers,
  routes.healthcareProfessionals,
  routes.workingAt,
  routes.about,
  routes.aboutBlood,
  routes.aboutDonating,
  routes.aboutSperm,
  routes.contact,
  routes.education,
  routes.faq,
  routes.givingBlood,
  routes.healthcare,
  routes.news,
  routes.ourExpertise,
  routes.research,
  routes.whatWeDo,
  routes.notFound,
  routes.notFoundAlt,
  routes.privacy,
  routes.terms,
  routes.vulnerabilityDisclosure,
];
