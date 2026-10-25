import AuthRepository from "./authRepository";
import AvatarRepository from "./avatarRepository";
import BookingRepository from "./bookingRepository";
import ChatRepository from "./chatRepository";
import MeetupRepository from "./meetupRepository";
import DonorRepository from "./donorRepository";
import QuestionnaireRepository from "./questionnaireRepository";
import HospitalRepository from "./hospitalRepository";
import NewsRepository from "./newsRepository";
import PublicRepository from "./publicRepository";
import NinRepository from "./ninRepository";
import NotificationRepository from "./notificationRepository";
import WalletRepository from "./walletRepository";
import WelfareRepository from "./welfareRepository";
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
  public: PublicRepository(),
  nin: NinRepository(),
  notifications: NotificationRepository(),
  wallet: WalletRepository(),
  welfare: WelfareRepository(),
};
