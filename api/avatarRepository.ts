import { fetcher } from "@/services/http";
import { IAvatar } from "../types";
import { IResponse } from "../types";
import { endpoints } from "@/services/endpoints";

export default function avatarRepository() {
  return {
    getAvatars(): Promise<IResponse<{ data: IAvatar[] }>> {
      return fetcher<{ data: IAvatar[] }>(endpoints.avatar, {
        method: "GET",
      });
    },
    setAvatar(profileImage: string): Promise<IResponse<{ data: IAvatar }>> {
      return fetcher<{ data: IAvatar }>(endpoints.avatar, {
        method: "POST",
        data: { profileImage },
      });
    },
  };
}
