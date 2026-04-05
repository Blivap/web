"use client";

import { useMemo } from "react";
import { Provider } from "react-redux";
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

  return <Provider store={store}>{children}</Provider>;
}
