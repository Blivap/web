import { fetcher } from "@/services/http";
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
import { endpoints } from "@/services/endpoints";

const url = "/authentication";

export default function authRepository() {
  return {
    login(payload: ILoginPayload): Promise<IResponse<IAuthResponse>> {
      return fetcher<IAuthResponse>(endpoints.auth.login, {
        method: "POST",
        data: payload,
      });
    },
    register(payload: IRegisterApiPayload): Promise<IResponse<IAuthResponse>> {
      return fetcher<IAuthResponse>(endpoints.auth.register, {
        method: "POST",
        data: payload,
      });
    },
    verifyEmail(
      payload: IVerifyEmailPayload,
    ): Promise<IResponse<{ message?: string }>> {
      return fetcher(endpoints.auth.verifyEmail, {
        method: "POST",
        data: payload,
      });
    },
    resendEmailVerificationLink(
      query: IResendVerificationQuery,
    ): Promise<IResponse<{ message?: string }>> {
      return fetcher(
        endpoints.auth.resendEmailVerificationLinkWithParams({
          email: query.email,
        }),
        {
          method: "POST",
        },
      );
    },
    forgotPassword(
      payload: IForgotPasswordPayload,
    ): Promise<IResponse<{ message?: string }>> {
      return fetcher(endpoints.auth.forgotPassword, {
        method: "POST",
        data: payload,
      });
    },
    resetPassword(
      payload: IResetPasswordPayload,
    ): Promise<IResponse<{ message?: string }>> {
      return fetcher(endpoints.auth.resetPassword, {
        method: "POST",
        data: payload,
      });
    },
    me(): Promise<IResponse<IAuthResponse["user"]>> {
      return fetcher<IAuthResponse["user"]>(endpoints.auth.me, {
        method: "GET",
      });
    },
    updateProfile(
      payload: IEditProfilePayload,
    ): Promise<IResponse<IAuthResponse["user"]>> {
      return fetcher<IAuthResponse["user"]>(endpoints.auth.me, {
        method: "PUT",
        data: payload,
      });
    },
    changePassword(
      payload: IChangePasswordPayload,
    ): Promise<IResponse<{ message?: string }>> {
      return fetcher(endpoints.auth.changePassword, {
        method: "PUT",
        data: payload,
      });
    },
    logout(): Promise<IResponse<unknown>> {
      return fetcher(endpoints.auth.logout, {
        method: "POST",
      });
    },
  };
}
