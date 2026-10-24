import { $api } from "@/app/api";
import { routes } from "@/config/routes";
import { extractAccessTokenExpires } from "@/lib/auth/sessionExpiry";
import {
  consumeStoredDn,
  markPostLoginNavigation,
  resolveDnRedirect,
  withDn,
} from "@/lib/navigation/authRedirect";
import { isEmailUnverified, normalizeUser } from "@/lib/utils";
import { setCredentials, setUser } from "@/store/slices/authSlice";
import type { AppDispatch } from "@/store/store";
import { IAuthResponse } from "@/types";

type ReplaceRouter = {
  replace: (href: string) => void;
};

export function readAuthEnvelope(data: unknown): IAuthResponse {
  const envelope = (data || {}) as {
    message?: string;
    data?: IAuthResponse;
  };
  return envelope.data ?? ((data || {}) as IAuthResponse);
}

export function accessTokenFrom(authData: IAuthResponse): string | undefined {
  return authData?.accessToken ?? authData?.access_token ?? authData?.token;
}

/** Stores the Blivap session and sends the person to verify-email or the app. */
export async function applyAuthSession(args: {
  authData: IAuthResponse;
  dispatch: AppDispatch;
  router: ReplaceRouter;
  searchParams: { get: (name: string) => string | null };
}): Promise<boolean> {
  const token = accessTokenFrom(args.authData);
  if (!token) return false;

  // Resolve before async work so a later navigation cannot drop `dn`.
  const dnRedirect = resolveDnRedirect(args.searchParams);
  // Prevent AuthLayout from racing to /overview while we finish me() + replace.
  markPostLoginNavigation();
  args.dispatch(
    setCredentials({
      token,
      expiresAt: extractAccessTokenExpires(args.authData),
    }),
  );

  let userPayload = normalizeUser(args.authData?.user ?? args.authData) ?? null;
  if (!userPayload) {
    try {
      const me = await $api.auth.me();
      if (me.status >= 200 && me.status < 300 && me.data) {
        userPayload = normalizeUser(me.data);
      }
    } catch {
      /* session token may lag; routing still uses the login envelope */
    }
  }
  if (userPayload) {
    args.dispatch(setUser(userPayload));
  }
  // Prefer live URL / storage in case another effect already mutated the route.
  const returnTo =
    resolveDnRedirect(args.searchParams) ?? dnRedirect ?? consumeStoredDn();
  if (isEmailUnverified(userPayload ?? args.authData?.user)) {
    args.router.replace(withDn(routes.verifyEmail, returnTo));
  } else {
    if (returnTo) consumeStoredDn();
    args.router.replace(returnTo ?? routes.overview);
  }
  return true;
}
