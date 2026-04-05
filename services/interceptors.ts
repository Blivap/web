import axios, { AxiosResponse } from "axios";
import { logout } from "@/app/store/slices/authSlice";
import { getClientStore } from "@/app/store/store";

function dispatchLogoutOn401() {
  if (typeof window === "undefined") return;
  const store = getClientStore();
  if (store) store.dispatch(logout());
}

export async function intercept<T = unknown>(
  request: Promise<AxiosResponse<T>>,
): Promise<AxiosResponse<T>> {
  try {
    const res = await request;
    if (res.status === 401) {
      dispatchLogoutOn401();
      throw new Error(res.statusText || "Unauthorized");
    }
    return res;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      dispatchLogoutOn401();
    }
    throw error;
  }
}
