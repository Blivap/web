export type IRegisterPayload = {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  /** ISO date string `YYYY-MM-DD` from the date picker. */
  dateOfBirth: string;
};

export type IRegisterApiPayload = {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  dateOfBirth: string;
};
export type IResponse<T> = {
  data?: T;
  status: number;
  message: string;
  error?: string | null;
  errors?: Record<string, string[]>;
  meta?: {
    total: number;
    page: number;
    limit: number;
  } | null;
};
export type ILoginPayload = {
  email: string;
  password: string;
};

export type IAuthUser = {
  email?: string;
  firstName?: string;
  lastName?: string;
};
export type IUser = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  emailVerified: boolean;
  phonenumber: string | null;
  dateOfBirth: string | null;
  nationalIdentificationNumber: string | null;
  nationalIdentificationNumberVerified: boolean;
  profileImage: string | null;
  hasAcceptedTermsAndConditions: boolean;
  isDeleted: boolean;
  lastActive: string;
};
export type IAvatar = {
  id: string;
  publicId: string;
  url: string;
};
export type IAuthResponse = {
  accessToken?: string;
  access_token?: string;
  token?: string;
  user?: IUser | null;
};

export type IVerifyEmailPayload = {
  emailValidationToken: string;
  email: string;
};

export type IResendVerificationQuery = {
  email: string;
};

export type IForgotPasswordPayload = {
  email: string;
};

export type IResetPasswordPayload = {
  resetToken: string;
  password: string;
};

export type IEditProfilePayload = {
  firstname?: string;
  lastname?: string;
  phonenumber?: string | null;
  profileImage?: string | null;
};

export type IChangePasswordPayload = {
  oldPassword: string;
  password: string;
};

export interface INewsItem {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  lang: string;
  source: ISource;
}

export interface ISource {
  id: string;
  name: string;
  url: string;
  country: string;
}
