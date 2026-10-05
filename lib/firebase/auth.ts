import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  getAuth,
  signInWithPopup,
  AuthProvider,
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
  const config = firebaseWebConfig();
  if (!config) return null;
  return getApps().length ? getApp() : initializeApp(config);
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

/** Firebase ID token for POST /authentication/social. */
export async function signInForIdToken(provider: SocialProvider): Promise<string> {
  const app = firebaseApp();
  if (!app) {
    throw new Error("Social sign-in is not configured");
  }
  const result = await signInWithPopup(getAuth(app), providerFor(provider));
  return result.user.getIdToken();
}

export function socialAuthErrorMessage(error: unknown): string | null {
  if (error && typeof error === "object" && "code" in error) {
    const code = String((error as { code?: string }).code);
    if (
      code === "auth/popup-closed-by-user" ||
      code === "auth/cancelled-popup-request"
    ) {
      return null;
    }
    if (code === "auth/popup-blocked") {
      return "Allow pop-ups to continue with this account";
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Could not sign in with that account";
}
