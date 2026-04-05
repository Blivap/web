import axios, { AxiosResponse } from "axios";
import Cookies from "js-cookie";
import { config } from "@/config/env";

export default function NinRepository() {
  return {
    /**
     * POST /nin-verification — multipart file upload. Do not set Content-Type;
     * the browser sets multipart boundaries for FormData.
     */
    verifyNinDocument(file: File): Promise<AxiosResponse<unknown>> {
      const token =
        typeof window !== "undefined"
          ? Cookies.get("auth_token") || null
          : null;
      const formData = new FormData();
      formData.append("file", file);

      return axios({
        url: `${config.apiUrl}/nin-verification`,
        method: "POST",
        data: formData,
        headers: {
          Accept: "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
    },
  };
}
