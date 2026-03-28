import AuthRepository from "./authRepository";
import AvatarRepository from "./avatarRepository";
import NewsRepository from "./newsRepository";
export const $api = {
  auth: AuthRepository(),
  avatar: AvatarRepository(),
  news: NewsRepository(),
};
