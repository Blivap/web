import type { IUser } from "@/types";

/** True when phone and date of birth are both present (social sign-up skips these). */
export function hasRequiredProfileDetails(
  user: Pick<IUser, "phonenumber" | "dateOfBirth"> | null | undefined,
): boolean {
  if (!user) return false;
  const phoneDigits = (user.phonenumber ?? "").replace(/\D/g, "");
  const dob = (user.dateOfBirth ?? "").trim();
  return phoneDigits.length >= 6 && dob.length > 0;
}

export function needsRequiredProfileDetails(
  user: Pick<IUser, "phonenumber" | "dateOfBirth"> | null | undefined,
): boolean {
  return !hasRequiredProfileDetails(user);
}
