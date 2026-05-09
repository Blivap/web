import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { IUser } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type LooseRecord = Record<string, unknown>

function asString(
  value: unknown,
  ...alts: unknown[]
): string {
  const candidates = [value, ...alts]
  for (const c of candidates) {
    if (typeof c === "string" && c.length > 0) return c
    if (typeof c === "number" && !Number.isNaN(c)) return String(c)
  }
  return ""
}

/**
 * Maps API user payloads (snake_case, nested `user`, or auth envelopes) into `IUser`.
 * Returns `null` when the value cannot be interpreted as a user.
 */
export function normalizeUser(input: unknown): IUser | null {
  if (input == null || typeof input !== "object") return null

  const obj = input as LooseRecord

  /* Common envelopes: GET /me and auth responses often wrap the profile in `data`. */
  if ("data" in obj && obj.data != null && typeof obj.data === "object") {
    const fromData = normalizeUser(obj.data)
    if (fromData) return fromData
  }

  if ("user" in obj && obj.user != null && typeof obj.user === "object") {
    return normalizeUser(obj.user)
  }

  const hasTokenEnvelope =
    "accessToken" in obj ||
    "access_token" in obj ||
    obj.token !== undefined

  const hasUserIdentity = "id" in obj || "email" in obj

  if (hasTokenEnvelope && !hasUserIdentity) {
    return null
  }

  const id = asString(obj.id, obj._id, obj.userId, obj.user_id)
  const email = asString(obj.email)

  if (!id || !email) {
    return null
  }

  const firstname = asString(
    obj.firstname,
    obj.firstName,
    obj.first_name,
  )
  const lastname = asString(obj.lastname, obj.lastName, obj.last_name)

  const emailVerified =
    typeof obj.emailVerified === "boolean"
      ? obj.emailVerified
      : typeof obj.email_verified === "boolean"
        ? obj.email_verified
        : typeof obj.isEmailVerified === "boolean"
          ? obj.isEmailVerified
          : false

  const phonenumber =
    typeof obj.phonenumber === "string"
      ? obj.phonenumber
      : typeof obj.phone_number === "string"
        ? obj.phone_number
        : null

  const dateOfBirth =
    typeof obj.dateOfBirth === "string"
      ? obj.dateOfBirth
      : typeof obj.date_of_birth === "string"
        ? obj.date_of_birth
        : null

  const nationalIdentificationNumber =
    typeof obj.nationalIdentificationNumber === "string"
      ? obj.nationalIdentificationNumber
      : typeof obj.national_identification_number === "string"
        ? obj.national_identification_number
        : null

  const nationalIdentificationNumberVerified =
    typeof obj.nationalIdentificationNumberVerified === "boolean"
      ? obj.nationalIdentificationNumberVerified
      : typeof obj.national_identification_number_verified === "boolean"
        ? obj.national_identification_number_verified
        : false

  const profileImage =
    typeof obj.profileImage === "string"
      ? obj.profileImage
      : typeof obj.profile_image === "string"
        ? obj.profile_image
        : null

  const hasAcceptedTermsAndConditions =
    typeof obj.hasAcceptedTermsAndConditions === "boolean"
      ? obj.hasAcceptedTermsAndConditions
      : typeof obj.has_accepted_terms_and_conditions === "boolean"
        ? obj.has_accepted_terms_and_conditions
        : false

  const isDeleted =
    typeof obj.isDeleted === "boolean"
      ? obj.isDeleted
      : typeof obj.is_deleted === "boolean"
        ? obj.is_deleted
        : false

  const lastActive = asString(
    obj.lastActive,
    obj.last_active,
    new Date().toISOString(),
  )

  const rolesRaw = obj.roles
  const roles = Array.isArray(rolesRaw)
    ? rolesRaw.filter((r): r is string => typeof r === "string")
    : undefined

  return {
    id,
    firstname: firstname || email.split("@")[0] || "User",
    lastname: lastname || "",
    email,
    emailVerified,
    phonenumber,
    dateOfBirth,
    nationalIdentificationNumber,
    nationalIdentificationNumberVerified,
    profileImage,
    hasAcceptedTermsAndConditions,
    isDeleted,
    lastActive,
    ...(roles && roles.length > 0 ? { roles } : {}),
  }
}

/** True when the account should be treated as not yet email-verified. */
export function isEmailUnverified(user: unknown): boolean {
  if (user == null || typeof user !== "object") return true

  const u = user as LooseRecord

  if (typeof u.emailVerified === "boolean") return !u.emailVerified
  if (typeof u.email_verified === "boolean") return !u.email_verified
  if (typeof u.isEmailVerified === "boolean") return !u.isEmailVerified

  return true
}
