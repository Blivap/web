import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { IUser } from "@/types";
import {
  AUTH_TOKEN_COOKIE,
  clearAuthCookies,
  persistAuthCookies,
  readStoredTokenExpires,
} from "@/lib/auth/authCookies";

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  /** ISO timestamp from `accessTokenExpires` when known. */
  tokenExpiresAt: string | null;
  user: IUser | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  tokenExpiresAt: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        token: string;
        expiresAt?: string | null;
        user?: IUser;
      }>,
    ) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.tokenExpiresAt = action.payload.expiresAt ?? null;
      state.user = action.payload.user ?? null;
      persistAuthCookies(action.payload.token, state.tokenExpiresAt);
    },
    // Restore token + expiry from cookies only; user must be fetched via /me
    initializeAuth: (state) => {
      if (typeof window !== "undefined") {
        const token = Cookies.get(AUTH_TOKEN_COOKIE) || null;
        if (token) {
          state.token = token;
          state.tokenExpiresAt = readStoredTokenExpires();
          // isAuthenticated stays false until setUser or setCredentials runs
        }
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.tokenExpiresAt = null;
      state.user = null;
      clearAuthCookies();
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
