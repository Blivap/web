"use client";

import { useMemo } from "react";
import { Provider } from "react-redux";
import { initializeAuth } from "./slices/authSlice";
import { makeStore, AppStore, setClientStore } from "./store";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = useMemo<AppStore>(() => {
    const s = makeStore();
    setClientStore(s);
    /* Cookie → token in Redux before first paint so refresh/login flows see `token` immediately. */
    if (typeof window !== "undefined") {
      s.dispatch(initializeAuth());
    }
    return s;
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
