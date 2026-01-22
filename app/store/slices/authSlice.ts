import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { config } from "@/app/utils/config";
import { IUser } from "@/app/types";
interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: IUser | null;
}
const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user?: IUser }>,
    ) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user ?? null;
      console.log("[authSlice/setCredentials] new state:", {
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        user: state.user,
      });
      if (typeof window !== "undefined") {
        Cookies.set("auth_token", action.payload.token, {
          expires: 7,
          sameSite: "lax",
          secure: config.env === "production",
        });
      }
    },
    initializeAuth: (state) => {
      if (typeof window !== "undefined") {
        const token = Cookies.get("auth_token") || null;
        if (token) {
          state.isAuthenticated = true;
          state.token = token;
        }
      }
    },
    logout: (state) => {
      console.log("[authSlice/logout] previous state:", {
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        user: state.user,
      });
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      Cookies.remove("auth_token");
    },
    setUser: (state, action: PayloadAction<IUser>) => {
      console.log("[authSlice/setUser] new state:", {
        user: action.payload,
      });
      state.user = action.payload;
    },
  },
});

export const { setCredentials, logout, setUser, initializeAuth } =
  authSlice.actions;
export default authSlice.reducer;
