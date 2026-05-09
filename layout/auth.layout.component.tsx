"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { gsap } from "gsap";
import { useAppSelector } from "@/store/hooks";

const AUTH_ONLY_PAGES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated && pathname && AUTH_ONLY_PAGES.includes(pathname)) {
      router.replace("/overview");
    }
  }, [isAuthenticated, pathname, router]);

  useLayoutEffect(() => {
    if (!rootRef.current) return;

    const ctx = gsap.context(() => {
      gsap.set("[data-auth-form-shell]", { opacity: 0, y: 22 });
      gsap.set("[data-auth-hero-panel]", { opacity: 0, x: 56 });
      gsap.set("[data-auth-hero-copy] p", { opacity: 0, y: 18 });

      gsap
        .timeline({
          defaults: { ease: "power2.out" },
          onComplete: () => {
            gsap.set(
              [
                "[data-auth-form-shell]",
                "[data-auth-hero-panel]",
                "[data-auth-hero-copy] p",
              ],
              { clearProps: "transform" },
            );
          },
        })
        .to(
          "[data-auth-form-shell]",
          {
            opacity: 1,
            y: 0,
            duration: 0.52,
          },
          0,
        )
        .to(
          "[data-auth-hero-panel]",
          {
            opacity: 1,
            x: 0,
            duration: 0.68,
          },
          "<0.06",
        )
        .to(
          "[data-auth-hero-copy] p",
          {
            opacity: 1,
            y: 0,
            duration: 0.42,
            stagger: 0.1,
          },
          "<0.35",
        );
    }, rootRef);

    return () => {
      ctx.revert();
    };
  }, [pathname]);

  return (
    <div
      ref={rootRef}
      className="flex-1 flex justify-center items-center w-full min-h-0"
    >
      <div
        data-auth-form-shell
        className="flex justify-center w-full md:px-10 xl:px-23 py-6 px-3 z-1 relative"
      >
        {children}
      </div>
      <div className="w-full hidden lg:block" aria-hidden />
      <div
        data-auth-hero-panel
        className="fixed hidden lg:flex justify-center items-center w-1/2 right-0 top-0 bg-[#960018] rounded-l-[60px] h-full overflow-hidden self-end"
      >
        <Image
          src="/images/authbg.jpg"
          alt="Auth bg"
          fill
          priority
          className={`
                    object-cover
                    transition-opacity duration-700
                    rounded-l-[60px]
                    opacity-0
                    data-[loaded=true]:opacity-[0.6]
                    `}
          onLoad={(e) => {
            e.currentTarget.dataset.loaded = "true";
          }}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div
          data-auth-hero-copy
          className="grid gap-6 bg-[#FFFFFF33] px-11.5 py-[76.5px] relative backdrop-blur-[30px] max-w-139"
        >
          <p className="text-[48px] text-white font-semibold">
            Connecting People to Donors
          </p>
          <p className="text-[18px] text-[#F6F6F8]">
            Discover endless opportunities to receive blood and sperm donation.
          </p>
        </div>
      </div>
    </div>
  );
};
