import AuthRepository from "./authRepository";
import AvatarRepository from "./avatarRepository";
import DonorRepository from "./donorRepository";
import NewsRepository from "./newsRepository";
import NinRepository from "./ninRepository";
import NotificationRepository from "./notificationRepository";
export const $api = {
  auth: AuthRepository(),
  avatar: AvatarRepository(),
  donors: DonorRepository(),
  news: NewsRepository(),
  nin: NinRepository(),
  notifications: NotificationRepository(),
};
