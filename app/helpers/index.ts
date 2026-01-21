import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { config } from "../utils/config";
import { IResponse } from "../types";
import Cookies from "js-cookie";

export const fetcher = async <T = unknown>(
  url: string,
  options?: AxiosRequestConfig,
): Promise<IResponse<T>> => {
  const { apiUrl } = config;
  const token =
    typeof window !== "undefined" ? Cookies.get("auth_token") || null : null;

  const res: AxiosResponse<T> = await axios({
    url: `${apiUrl}${url}`,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  });

  return {
    data: res.data,
    status: res.status,
    message: res.statusText,
    error: null,
    errors: undefined,
    meta: undefined,
  };
};
