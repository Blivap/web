import { IUser } from "@/app/types";

/** API may return user in a nested `data`, `user`, or use snake_case. Normalize to IUser with emailVerified. */
export function normalizeUser(payload: unknown): IUser | null {
  if (!payload || typeof payload !== "object") return null;
  const raw =
    (payload as { data?: unknown }).data ??
    (payload as { user?: unknown }).user ??
    payload;
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  if (!obj.id || typeof obj.id !== "string") return null;
  return {
    id: obj.id as string,
    firstname: (obj.firstname as string) ?? "",
    lastname: (obj.lastname as string) ?? "",
    email: (obj.email as string) ?? "",
    emailVerified:
      obj.emailVerified === true ||
      (obj as { email_verified?: boolean }).email_verified === true,
    phonenumber: (obj.phonenumber as string | null) ?? null,
    dateOfBirth: (obj.dateOfBirth as string | null) ?? null,
    nationalIdentificationNumber:
      (obj.nationalIdentificationNumber as string | null) ?? null,
    nationalIdentificationNumberVerified:
      obj.nationalIdentificationNumberVerified === true ||
      (obj as { national_identification_number_verified?: boolean })
        .national_identification_number_verified === true,
    profileImage: (obj.profileImage as string | null) ?? null,
    hasAcceptedTermsAndConditions:
      obj.hasAcceptedTermsAndConditions === true ||
      (obj as { has_accepted_terms_and_conditions?: boolean })
        .has_accepted_terms_and_conditions === true,
    isDeleted: obj.isDeleted === true,
    lastActive: (obj.lastActive as string) ?? "",
  };
}

/** True when we should redirect to verify-email (handles both camelCase and snake_case). */
export function isEmailUnverified(user: IUser | null | undefined): boolean {
  if (!user) return false;
  return (
    user.emailVerified === false ||
    (user as unknown as { email_verified?: boolean }).email_verified === false
  );
}
