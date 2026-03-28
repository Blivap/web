import { routes } from "./routes";

/**
 * Backend-aligned roles (not yet on `IUser` in types — wire when API exposes `role`).
 */
export enum Role {
  DONOR = "donor",
  HOSPITAL = "hospital",
  ADMIN = "admin",
}

/** Feature flags for UI / API checks. */
export const permissions: Record<Role, readonly string[]> = {
  [Role.DONOR]: [
    "view_profile",
    "edit_profile",
    "browse_donors",
    "book_appointment",
    "view_wallet",
    "view_history",
  ],
  [Role.HOSPITAL]: [
    "view_profile",
    "edit_profile",
    "browse_donors",
    "create_request",
    "manage_requests",
  ],
  [Role.ADMIN]: [
    "manage_users",
    "manage_requests",
    "view_all_data",
    "browse_donors",
  ],
};

/**
 * Role rules for authenticated app areas (see `routes`).
 * Longer `prefix` is matched first — e.g. `/donors/new` before `/donors`.
 *
 * Routes not listed here are not restricted by role in this helper (auth middleware still applies).
 */
export const routeRoleRules: readonly {
  prefix: string;
  roles: readonly Role[];
}[] = [
  { prefix: routes.donorsNew, roles: [Role.DONOR, Role.HOSPITAL, Role.ADMIN] },
  { prefix: routes.donors, roles: [Role.DONOR, Role.HOSPITAL, Role.ADMIN] },
  { prefix: routes.selectAvatar, roles: [Role.DONOR, Role.ADMIN] },
  { prefix: routes.verifyEmail, roles: [Role.DONOR, Role.HOSPITAL, Role.ADMIN] },
  { prefix: routes.overview, roles: [Role.DONOR, Role.HOSPITAL, Role.ADMIN] },
  { prefix: routes.dashboard, roles: [Role.DONOR, Role.HOSPITAL, Role.ADMIN] },
  { prefix: routes.wallet, roles: [Role.DONOR, Role.ADMIN] },
  { prefix: routes.history, roles: [Role.DONOR, Role.ADMIN] },
  { prefix: routes.settings, roles: [Role.DONOR, Role.HOSPITAL, Role.ADMIN] },
];

function normalizePathname(pathname: string): string {
  const path = pathname.split("?")[0] ?? pathname;
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

function matchesPrefix(pathname: string, prefix: string): boolean {
  if (pathname === prefix) return true;
  return pathname.startsWith(`${prefix}/`);
}

export function hasPermission(role: Role, permission: string): boolean {
  const list = permissions[role];
  return list?.includes(permission) ?? false;
}

/**
 * Returns whether `role` may access this pathname under role rules.
 * Unlisted paths return `true` (no extra role gate — use auth middleware for login).
 */
export function canAccessRoute(role: Role, pathname: string): boolean {
  const path = normalizePathname(pathname);
  const sorted = [...routeRoleRules].sort(
    (a, b) => b.prefix.length - a.prefix.length,
  );

  for (const rule of sorted) {
    if (matchesPrefix(path, rule.prefix)) {
      return rule.roles.includes(role);
    }
  }

  return true;
}
