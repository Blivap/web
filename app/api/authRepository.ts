import { fetcher } from "../helpers";
import {
  IRegisterApiPayload,
  ILoginPayload,
  IAuthResponse,
  IVerifyEmailPayload,
  IResendVerificationQuery,
  IForgotPasswordPayload,
  IResetPasswordPayload,
  IEditProfilePayload,
  IChangePasswordPayload,
} from "../types";
import { IResponse } from "../types";

const url = "/authentication";

export default function authRepository() {
  return {
    login(payload: ILoginPayload): Promise<IResponse<IAuthResponse>> {
      return fetcher<IAuthResponse>(`${url}/login`, {
        method: "POST",
        data: payload,
      });
    },
    register(payload: IRegisterApiPayload): Promise<IResponse<IAuthResponse>> {
      return fetcher<IAuthResponse>(`${url}/signup`, {
        method: "POST",
        data: payload,
      });
    },
    verifyEmail(
      payload: IVerifyEmailPayload,
    ): Promise<IResponse<{ message?: string }>> {
      return fetcher(`${url}/verify-email`, {
        method: "POST",
        data: payload,
      });
    },
    resendEmailVerificationLink(
      query: IResendVerificationQuery,
    ): Promise<IResponse<{ message?: string }>> {
      const params = new URLSearchParams({ email: query.email });
      return fetcher(`${url}/resend-email-verification-link?${params}`, {
        method: "POST",
      });
    },
    forgotPassword(
      payload: IForgotPasswordPayload,
    ): Promise<IResponse<{ message?: string }>> {
      return fetcher(`${url}/forgot-password`, {
        method: "POST",
        data: payload,
      });
    },
    resetPassword(
      payload: IResetPasswordPayload,
    ): Promise<IResponse<{ message?: string }>> {
      return fetcher(`${url}/reset-password`, {
        method: "POST",
        data: payload,
      });
    },
    me(): Promise<IResponse<IAuthResponse["user"]>> {
      return fetcher<IAuthResponse["user"]>(`${url}/me`, {
        method: "GET",
      });
    },
    updateProfile(
      payload: IEditProfilePayload,
    ): Promise<IResponse<IAuthResponse["user"]>> {
      return fetcher<IAuthResponse["user"]>(`${url}/me`, {
        method: "PUT",
        data: payload,
      });
    },
    changePassword(
      payload: IChangePasswordPayload,
    ): Promise<IResponse<{ message?: string }>> {
      return fetcher(`${url}/change-password`, {
        method: "PUT",
        data: payload,
      });
    },
    logout(): Promise<IResponse<unknown>> {
      return fetcher(`${url}/logout`, {
        method: "POST",
      });
    },
  };
}
