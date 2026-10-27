import { fetcher } from "@/services/http";
import { AvatarListMeta, IAvatar } from "../../types";
import { IResponse } from "../../types";
import { endpoints } from "@/services/endpoints";

type AvatarListBody = {
  data: IAvatar[];
  meta?: Partial<AvatarListMeta> | null;
};

export default function avatarRepository() {
  return {
    getAvatars(page = 1): Promise<IResponse<AvatarListBody>> {
      const nextPage = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;
      return fetcher<AvatarListBody>(endpoints.avatar, {
        method: "GET",
        params: { page: nextPage },
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
