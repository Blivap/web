import { fetcher } from "@/services/http";
import { endpoints } from "@/services/endpoints";

export default function NinRepository() {
  return {
    /**
     * POST /nin-verification — multipart file upload.
     * `fetcher` omits `Content-Type: application/json` for FormData so axios
     * sends `multipart/form-data` with the correct boundary.
     */
    verifyNinDocument(file: File) {
      const formData = new FormData();
      formData.append("file", file);

      return fetcher(endpoints.ninVerification, {
        method: "POST",
        data: formData,
      });
    },
  };
}
