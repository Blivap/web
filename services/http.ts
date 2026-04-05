import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { config } from "@/config/env";
import { IResponse } from "@/types";
import Cookies from "js-cookie";
import { intercept } from "./interceptors";

export const fetcher = async <T = unknown>(
  url: string,
  options?: AxiosRequestConfig,
): Promise<IResponse<T>> => {
  const { apiUrl } = config;
  const token =
    typeof window !== "undefined" ? Cookies.get("auth_token") || null : null;

  const isFormData =
    typeof FormData !== "undefined" && options?.data instanceof FormData;

  const res: AxiosResponse<T> = await intercept(
    axios({
      ...options,
      url: `${apiUrl}${url}`,
      headers: {
        Accept: "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(!isFormData && { "Content-Type": "application/json" }),
        ...options?.headers,
      },
    }),
  );

  return {
    data: res.data,
    status: res.status,
    message: res.statusText,
    error: null,
    errors: undefined,
    meta: undefined,
  };
};
