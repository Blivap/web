import AuthRepository from "./authRepository";
import AvatarRepository from "./avatarRepository";
import BookingRepository from "./bookingRepository";
import DonorRepository from "./donorRepository";
import HospitalRepository from "./hospitalRepository";
import NewsRepository from "./newsRepository";
import NinRepository from "./ninRepository";
import NotificationRepository from "./notificationRepository";
export const $api = {
  auth: AuthRepository(),
  avatar: AvatarRepository(),
  bookings: BookingRepository(),
  donors: DonorRepository(),
  hospitals: HospitalRepository(),
  news: NewsRepository(),
  nin: NinRepository(),
  notifications: NotificationRepository(),
};
