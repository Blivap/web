import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { config } from "@/config/env";
import { IUser } from "@/types";
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
      if (typeof window !== "undefined") {
        Cookies.set("auth_token", action.payload.token, {
          expires: 7,
          sameSite: "lax",
          secure: config.env === "production",
        });
      }
    },
    // Restore token from cookie only; user must be fetched via /me before we set isAuthenticated
    initializeAuth: (state) => {
      if (typeof window !== "undefined") {
        const token = Cookies.get("auth_token") || null;
        if (token) {
          state.token = token;
          // isAuthenticated stays false until setUser or setCredentials runs (after /me or login)
        }
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      Cookies.remove("auth_token");
    },
    setUser: (state, action: PayloadAction<IUser>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
});

export const { setCredentials, logout, setUser, initializeAuth } =
  authSlice.actions;
export default authSlice.reducer;
