import { fetcher } from "@/services/http";
import { endpoints } from "@/services/endpoints";
import type { IResponse } from "@/types";

export default function ChatRepository() {
  return {
    messages(
      donationId: string,
      params?: { limit?: number; before?: string },
    ): Promise<IResponse<unknown>> {
      const sp = new URLSearchParams();
      if (params?.limit != null) sp.set("limit", String(params.limit));
      if (params?.before) sp.set("before", params.before);
      const qs = sp.toString();
      const path = `${endpoints.chat.messages(donationId)}${qs ? `?${qs}` : ""}`;
      return fetcher(path, { method: "GET" });
    },

    arrived(donationId: string): Promise<IResponse<unknown>> {
      return fetcher(endpoints.chat.arrived(donationId), { method: "POST" });
    },

    /** Optional: multipart upload for jpeg/png/pdf. */
    uploadMedia(donationId: string, file: File): Promise<IResponse<unknown>> {
      const fd = new FormData();
      fd.append("file", file);
      return fetcher(endpoints.chat.media(donationId), {
        method: "POST",
        data: fd,
      });
    },
  };
}
