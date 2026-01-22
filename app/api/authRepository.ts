import { fetcher } from "../helpers";
import { IRegisterApiPayload, ILoginPayload, IAuthResponse } from "../types";
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
    me(): Promise<IResponse<IAuthResponse["user"]>> {
      return fetcher<IAuthResponse["user"]>(`${url}/me`, {
        method: "GET",
      });
    },
  };
}
