import AuthRepository from "./authRepository";
import AvatarRepository from "./avatarRepository";
import BookingRepository from "./bookingRepository";
import ChatRepository from "./chatRepository";
import MeetupRepository from "./meetupRepository";
import DonorRepository from "./donorRepository";
import QuestionnaireRepository from "./questionnaireRepository";
import HospitalRepository from "./hospitalRepository";
import NewsRepository from "./newsRepository";
import NinRepository from "./ninRepository";
import NotificationRepository from "./notificationRepository";
export const $api = {
  auth: AuthRepository(),
  avatar: AvatarRepository(),
  bookings: BookingRepository(),
  chat: ChatRepository(),
  meetups: MeetupRepository(),
  donors: DonorRepository(),
  questionnaire: QuestionnaireRepository(),
  hospitals: HospitalRepository(),
  news: NewsRepository(),
  nin: NinRepository(),
  notifications: NotificationRepository(),
};
