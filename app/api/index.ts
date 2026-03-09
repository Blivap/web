import AuthRepository from "./authRepository";
import AvatarRepository from "./avatarRepository";
export const $api = {
  auth: AuthRepository(),
  avatar: AvatarRepository(),
};
