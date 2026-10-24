import axios from "axios";

/** Friendly copy when the Blivap API cannot be reached. */
export const API_UNREACHABLE_MESSAGE =
  "We can’t reach Blivap right now. Check your connection or try again in a moment.";

export class ApiNetworkError extends Error {
  readonly code = "API_NETWORK" as const;

  constructor(message = API_UNREACHABLE_MESSAGE) {
    super(message);
    this.name = "ApiNetworkError";
  }
}

export function isNetworkFailure(error: unknown): boolean {
  if (error instanceof ApiNetworkError) return true;
  if (!axios.isAxiosError(error)) return false;
  if (error.code === "ERR_NETWORK" || error.code === "ECONNABORTED") {
    return true;
  }
  if (!error.response && error.message === "Network Error") return true;
  return false;
}
