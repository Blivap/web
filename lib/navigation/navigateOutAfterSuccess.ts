import { routes } from "@/config/routes";

type MinimalRouter = {
  back: () => void;
  replace: (href: string) => void;
};

/** Prefer browser history; if there is nowhere to go back, open overview. */
export function navigateOutAfterSuccess(router: MinimalRouter) {
  if (typeof window !== "undefined" && window.history.length > 1) {
    router.back();
  } else {
    router.replace(routes.overview);
  }
}
