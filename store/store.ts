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

/** Set from StoreProvider so API layer can dispatch (e.g. 401 logout) without React hooks. */
let clientStore: ReturnType<typeof makeStore> | undefined;

export const setClientStore = (store: ReturnType<typeof makeStore>) => {
  clientStore = store;
};

export const getClientStore = () => clientStore;

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
