import { fetcher } from "../app/helpers";
import { IAvatar } from "../types";
import { IResponse } from "../types";

export default function avatarRepository() {
  return {
    getAvatars(): Promise<IResponse<{ data: IAvatar[] }>> {
      return fetcher<{ data: IAvatar[] }>("/avatar", {
        method: "GET",
      });
    },
    setAvatar(profileImage: string): Promise<IResponse<{ data: IAvatar }>> {
      return fetcher<{ data: IAvatar }>("/avatar", {
        method: "POST",
        data: { profileImage },
      });
    },
  };
}
