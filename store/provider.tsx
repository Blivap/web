"use client";

import { useEffect, useMemo } from "react";
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
    return s;
  }, []);

  /* Restore cookie → token only after mount so SSR HTML matches the client's first paint. */
  useEffect(() => {
    store.dispatch(initializeAuth());
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
