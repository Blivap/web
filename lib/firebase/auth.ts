import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  getAuth,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
  AuthProvider,
  UserCredential,
} from "firebase/auth";

import { config } from "@/config/env";

export type SocialProvider = "google" | "apple" | "facebook";

function firebaseWebConfig() {
  const { apiKey, authDomain, projectId, appId, messagingSenderId } =
    config.firebase;
  if (!apiKey || !authDomain || !projectId || !appId) {
    return null;
  }
  return {
    apiKey,
    authDomain,
    projectId,
    appId,
    ...(messagingSenderId ? { messagingSenderId } : {}),
  };
}

export function isFirebaseAuthConfigured(): boolean {
  return firebaseWebConfig() !== null;
}

function firebaseApp(): FirebaseApp | null {
  const cfg = firebaseWebConfig();
  if (!cfg) return null;
  return getApps().length ? getApp() : initializeApp(cfg);
}

function providerFor(provider: SocialProvider): AuthProvider {
  if (provider === "google") {
    const google = new GoogleAuthProvider();
    google.addScope("email");
    google.addScope("profile");
    return google;
  }
  if (provider === "facebook") {
    const facebook = new FacebookAuthProvider();
    facebook.addScope("email");
    return facebook;
  }
  const apple = new OAuthProvider("apple.com");
  apple.addScope("email");
  apple.addScope("name");
  return apple;
}

async function idTokenFromCredential(
  credential: UserCredential,
): Promise<string> {
  return credential.user.getIdToken();
}

/**
 * Completes a redirect-based social sign-in (Safari / popup-blocked fallback).
 * Returns null when there is no pending redirect result.
 */
export async function completeSocialRedirect(): Promise<string | null> {
  const app = firebaseApp();
  if (!app) return null;
  const result = await getRedirectResult(getAuth(app));
  if (!result) return null;
  return idTokenFromCredential(result);
}

/** Firebase ID token for POST /authentication/social. */
export async function signInForIdToken(
  provider: SocialProvider,
): Promise<string> {
  const app = firebaseApp();
  if (!app) {
    throw new Error("Social sign-in is not configured");
  }
  const auth = getAuth(app);
  const oauthProvider = providerFor(provider);
  try {
    const result = await signInWithPopup(auth, oauthProvider);
    return idTokenFromCredential(result);
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error
        ? String((error as { code?: string }).code)
        : "";
    if (code === "auth/popup-blocked") {
      await signInWithRedirect(auth, oauthProvider);
      // Navigation away — caller should not treat this as failure.
      throw Object.assign(new Error("redirecting"), {
        code: "auth/redirecting",
      });
    }
    throw error;
  }
}

export function socialAuthErrorMessage(error: unknown): string | null {
  if (error && typeof error === "object" && "code" in error) {
    const code = String((error as { code?: string }).code);
    if (
      code === "auth/popup-closed-by-user" ||
      code === "auth/cancelled-popup-request" ||
      code === "auth/redirecting"
    ) {
      return null;
    }
    if (code === "auth/popup-blocked") {
      return "Allow pop-ups to continue with this account";
    }
    if (
      code === "auth/configuration-not-found" ||
      code === "auth/operation-not-allowed"
    ) {
      return "Social sign-in is not enabled yet. Ask an admin to turn on Authentication providers in Firebase.";
    }
    if (code === "auth/account-exists-with-different-credential") {
      return "An account already exists with this email using a different sign-in method";
    }
    if (code === "auth/unauthorized-domain") {
      return "This domain is not authorized for social sign-in";
    }
  }
  if (error instanceof Error && error.message) {
    if (error.message === "Social sign-in is not configured") {
      return "Social sign-in is not configured on this app";
    }
    return error.message;
  }
  return "Could not sign in with that account";
}
