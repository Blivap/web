"use client";

import { Button } from "@/components/button/button.component";
import { BlivapLogo } from "@/public/svg";
import classNames from "classnames";
import { gsap } from "gsap";
import { Globe, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PropsWithChildren,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

const randomBetween = (minMs: number, maxMs: number) =>
  Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;

export const HomeLayout = (props: PropsWithChildren<unknown>) => {
  const pathName = usePathname();
  const contentRef = useRef<HTMLDivElement>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [isBannerHovered, setIsBannerHovered] = useState(false);

  useEffect(() => {
    if (bannerVisible && isBannerHovered) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    const scheduleToggle = () => {
      const duration = bannerVisible
        ? randomBetween(10000, 18000)
        : randomBetween(12000, 22000);
      timeoutId = setTimeout(() => {
        setBannerVisible((v) => {
          if (v) setIsBannerHovered(false);
          return !v;
        });
      }, duration);
    };
    scheduleToggle();
    return () => clearTimeout(timeoutId);
  }, [bannerVisible, isBannerHovered]);

  const isActive = (href: string) => {
    if (href === "/") return pathName === "/";
    return pathName.includes(href);
  };

  const closeDrawer = () => setDrawerOpen(false);

  useLayoutEffect(() => {
    if (!contentRef.current || pathName === "/") return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const ctx = gsap.context(() => {
      const targets = Array.from(contentRef.current?.children ?? [])
        .flatMap((node) =>
          node instanceof HTMLElement ? Array.from(node.children) : [],
        )
        .filter((node): node is HTMLElement => node instanceof HTMLElement);

      if (targets.length === 0) return;

      gsap.set(targets, {
        opacity: 0,
        y: 24,
        willChange: "opacity, transform",
      });

      const observer = new IntersectionObserver(
        (entries) => {
          const visibleTargets = entries
            .filter((entry) => entry.isIntersecting)
            .map((entry) => entry.target as HTMLElement);

          if (visibleTargets.length === 0) return;

          visibleTargets.forEach((target) => observer.unobserve(target));

          gsap.to(visibleTargets, {
            opacity: 1,
            y: 0,
            duration: 0.58,
            ease: "power2.out",
            stagger: 0.1,
            clearProps: "opacity,transform,will-change",
          });
        },
        {
          rootMargin: "0px 0px -10% 0px",
          threshold: 0.12,
        },
      );

      targets.forEach((target) => observer.observe(target));

      return () => {
        observer.disconnect();
      };
    }, contentRef);

    return () => {
      ctx.revert();
    };
  }, [pathName]);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/researchers", label: "Researchers" },
    {
      href: "/healthcare&professionals",
      label: "Healthcare professionals",
    },
    {
      href: "/faq",
      label: "FAQ",
    },
  ];

  return (
    <div className="flex-1 pt-18 sm:pt-20 lg:pt-19">
      {/* Overlay for tablet/mobile when drawer is open */}
      <div
        onClick={closeDrawer}
        className={classNames(
          "fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ease-in-out",
          {
            "opacity-100 pointer-events-auto": drawerOpen,
            "opacity-0 pointer-events-none": !drawerOpen,
          },
        )}
      />

      {/* Drawer/Sidebar */}
      <div
        className={classNames(
          "fixed left-0 top-0 z-50 flex h-full w-full max-w-64 flex-col gap-4 border-r border-[#E5E7EB] bg-white px-5 pt-6 shadow-lg transition-transform duration-200 ease-out dark:border-white/10 dark:bg-[#0F1117] dark:shadow-[0_24px_60px_rgba(0,0,0,0.45)] lg:hidden",
          {
            "-translate-x-full": !drawerOpen,
            "translate-x-0": drawerOpen,
          },
        )}
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="flex justify-center font-semibold font-helvetica text-primary text-4xl tracking-tight">
              <BlivapLogo fill="#960018" className="size-10" />
              <span className="-mt-1 -ml-2">livap</span>
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={closeDrawer}
            className="rounded-md p-1.5"
            aria-label="Close menu"
          >
            <X size={18} />
          </Button>
        </div>
        <div className="flex flex-col gap-0">
          {navItems.map((e) => {
            const active = isActive(e.href);
            return (
              <Link
                key={`drawer-link-${e.label}`}
                href={e.href}
                onClick={closeDrawer}
                className={classNames(
                  "rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-[#F5F3FF] text-primary dark:bg-white/10 dark:text-white"
                    : "text-[#374151] hover:bg-[#F9FAFB] hover:text-primary dark:text-slate-300 dark:hover:bg-white/6 dark:hover:text-white",
                )}
              >
                {e.label}
              </Link>
            );
          })}
        </div>
        <div className="mt-2 flex flex-col gap-3 border-t border-[#E5E7EB] pt-4 dark:border-white/10">
          <Link
            href="/about"
            onClick={closeDrawer}
            className="text-sm font-medium text-[#374151] transition-colors hover:text-primary dark:text-slate-300 dark:hover:text-white"
          >
            About Blivap
          </Link>
          <div className="flex items-center gap-2 text-xs font-medium text-[#6B7280] dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Globe size={14} strokeWidth={1.5} /> NL
            </span>
            <span>|</span>
            <span>EN</span>
          </div>
        </div>
      </div>

      {/* Top Navigation Bar */}
      <div className="fixed top-0 z-40 flex w-full items-center justify-center border-b border-transparent bg-[#F4F2FF] px-2 sm:pb-0 py-2.5 dark:border-white/8 dark:bg-[#0F1117]/95 sm:px-6 sm:py-3 md:px-8 3xl:px-0">
        <div className="flex items-center justify-between w-full max-w-[1440px]">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => setDrawerOpen((prev) => !prev)}
              className="h-fit rounded-md border border-[#E5E7EB] bg-[#F9FAFB] p-1 text-text-primary transition-colors hover:bg-[#F3F4F6] lg:hidden dark:border-white/10 dark:bg-[#1A1A22] dark:text-white dark:hover:bg-white/8"
              aria-label="Toggle menu"
            >
              <Menu size={24} className="size-6" />
            </Button>

            <div className="hidden lg:flex gap-1">
              {navItems.map((e) => {
                const active = isActive(e.href);
                return (
                  <Link
                    key={`nav-link-${e.label}`}
                    href={e.href}
                    className={classNames(
                      "rounded-t-md px-3.5 pt-2.5 pb-3.5 text-sm font-medium transition-colors duration-200",
                      active
                        ? "bg-white text-black dark:bg-white/10 dark:text-white"
                        : "text-[#374151] hover:bg-white/60 dark:text-slate-300 dark:hover:bg-white/6 dark:hover:text-white",
                    )}
                  >
                    {e.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/about"
              className={classNames(
                "hidden rounded-t-md px-3.5 pt-2.5 pb-3.5 text-sm font-medium text-black transition-colors hover:bg-white/60 sm:inline dark:text-slate-300 dark:hover:bg-white/6 dark:hover:text-white",
                {
                  "bg-white dark:bg-white/10 dark:text-white":
                    isActive("/about"),
                },
              )}
            >
              About
            </Link>
            <div className="flex items-center gap-2 text-base font-medium text-[#6B7280] dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Globe size={14} strokeWidth={1.5} /> NL
              </span>
              <span>|</span>
              <span>EN</span>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={contentRef}
        className="max-w-[1440px] w-full lg:mx-auto px-2 sm:px-6 sm:py-3 md:px-8 3xl:px-0 overflow-hidden"
      >
        {props.children}
      </div>
      <div className="bg-black px-2 sm:px-6 sm:py-3 md:px-8 3xl:px-0 dark:bg-[#05070C]">
        <div className="relative mx-auto mt-6 flex max-w-[1440px] flex-col gap-6 pt-6 pb-6 sm:mt-8 sm:gap-8 sm:pt-8 sm:pb-8 md:mt-12 lg:px-0">
          <Link href="/" className="w-fit">
            <p className="flex justify-center font-semibold font-helvetica text-primary text-4xl tracking-tight">
              <BlivapLogo fill="#960018" className="size-10" />
              <span className="-mt-1 -ml-2">livap</span>
            </p>
          </Link>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-0 md:flex md:justify-between">
            {[
              {
                title: "Knowledge",
                items: [
                  { label: "Giving blood", href: "/giving-blood" },
                  { label: "About blood", href: "/about-blood" },
                  { label: "About sperm", href: "/about-sperm" },
                  { label: "Our expertise", href: "/our-expertise" },
                ],
              },
              {
                title: "Our audiences",
                items: [
                  { label: "Healthcare", href: "/healthcare" },
                  { label: "Donors", href: "/register" },
                ],
              },
              {
                title: "About Blivap",
                items: [
                  { label: "News", href: "/news" },
                  { label: "Education", href: "/education" },
                ],
              },
              {
                title: "Service & contract",
                items: [
                  { label: "Working at", href: "/working_at" },
                  { label: "Contact us", href: "/contact" },
                ],
              },
            ].map((section, i) => (
              <div key={i} className="flex flex-col gap-2 sm:gap-3">
                <p className="font-semibold text-base text-white/90">
                  {section.title}
                </p>
                {section.items.map((item, j) => (
                  <Link
                    key={j}
                    href={item.href}
                    className="text-xs text-white/80 hover:text-primary/90 transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
          <div
            onMouseEnter={() => setIsBannerHovered(true)}
            onMouseLeave={() => setIsBannerHovered(false)}
            className={classNames(
              "absolute -top-16 right-4 hidden max-w-[20rem] flex-col gap-3 rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 shadow-lg transition-opacity duration-500 ease-in-out sm:-top-20 sm:right-6 sm:flex md:right-12 lg:right-20 dark:border-white/10 dark:bg-[#111827] dark:shadow-[0_24px_60px_rgba(0,0,0,0.45)]",
              bannerVisible
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none",
            )}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.preventDefault();
                setBannerVisible(false);
              }}
              className="absolute top-2 right-2 rounded-full p-1 text-[#6B7280] dark:text-slate-400"
              aria-label="Close banner"
            >
              <X size={16} />
            </Button>
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-semibold leading-snug text-black dark:text-white">
                Save lives and earn with your blood or sperm
              </p>
              <p className="text-xs leading-relaxed text-[#6B7280] dark:text-slate-400">
                We connect donors with those in need.
              </p>
            </div>
            <Button
              variant="link"
              href="/register"
              className="text-xs font-medium py-2  px-6 rounded-full bg-primary text-white hover:bg-primary/90 hover:text-white! transition-colors mt-1 w-full sm:w-fit"
            >
              Register
            </Button>
          </div>
        </div>
      </div>
      <div className="flex bg-[#171717] px-2 sm:px-6 md:px-8 lg:px-0">
        <div className=" flex flex-col sm:flex-row py-4 sm:py-5 gap-3 sm:gap-4 px-4 sm:px-6 md:px-12 lg:px-20 w-full max-w-[1440px] mx-auto">
          {[
            {
              label: "Vulnerability disclosure",
              href: "/vulnerability-disclosure",
            },
            { label: "Privacy & cookies", href: "/privacy" },
            { label: "Terms and conditions", href: "/terms" },
          ].map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className="text-xs text-white/80 hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
