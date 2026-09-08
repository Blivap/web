import axios, { AxiosResponse } from "axios";
import { forceSessionEnd } from "@/lib/auth/forceSessionEnd";
import { endpoints } from "@/services/endpoints";

/** Auth endpoints where 401 means bad credentials, not an expired session. */
const AUTH_CREDENTIAL_PATHS = [
  endpoints.auth.login,
  endpoints.auth.register,
  endpoints.auth.signup,
  endpoints.auth.forgotPassword,
  endpoints.auth.resetPassword,
  endpoints.authAliases.requestPasswordReset,
  endpoints.authAliases.resetPassword,
] as const;

function isCredentialAuthRequest(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  const url = error.config?.url ?? "";
  return AUTH_CREDENTIAL_PATHS.some((path) => url.includes(path));
}

function shouldEndSessionFor401(errorOrUrl: unknown): boolean {
  if (typeof errorOrUrl === "string") {
    return !AUTH_CREDENTIAL_PATHS.some((path) => errorOrUrl.includes(path));
  }
  return !isCredentialAuthRequest(errorOrUrl);
}

export async function intercept<T = unknown>(
  request: Promise<AxiosResponse<T>>,
): Promise<AxiosResponse<T>> {
  try {
    const res = await request;
    if (res.status === 401) {
      const url = res.config?.url ?? "";
      if (shouldEndSessionFor401(url)) {
        forceSessionEnd();
      }
      throw new Error(res.statusText || "Unauthorized");
    }
    return res;
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      shouldEndSessionFor401(error)
    ) {
      forceSessionEnd();
    }
    throw error;
  }
}
