import Cookies from "js-cookie";

export const WALLET_BALANCE_HIDDEN_COOKIE = "blivap_wallet_balance_hidden";

export function readWalletBalanceHidden(): boolean {
  if (typeof window === "undefined") return false;
  return Cookies.get(WALLET_BALANCE_HIDDEN_COOKIE) === "1";
}

export function persistWalletBalanceHidden(hidden: boolean): void {
  if (typeof window === "undefined") return;
  Cookies.set(WALLET_BALANCE_HIDDEN_COOKIE, hidden ? "1" : "0", {
    expires: 365,
    sameSite: "lax",
    path: "/",
  });
}
