import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import selectAvatarReducer from "./slices/selectAvatarSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      selectAvatar: selectAvatarReducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
