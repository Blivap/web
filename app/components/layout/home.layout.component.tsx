"use client";

import classNames from "classnames";
import { Globe, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren, useState, useEffect } from "react";

const randomBetween = (minMs: number, maxMs: number) =>
  Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;

export const HomeLayout = (props: PropsWithChildren<unknown>) => {
  const pathName = usePathname();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const scheduleToggle = () => {
      const duration = bannerVisible
        ? randomBetween(10000, 18000)
        : randomBetween(12000, 22000);
      timeoutId = setTimeout(() => {
        setBannerVisible((v) => !v);
      }, duration);
    };
    scheduleToggle();
    return () => clearTimeout(timeoutId);
  }, [bannerVisible]);

  const isActive = (href: string) => {
    if (href === "/") return pathName === "/";
    return pathName.includes(href);
  };

  const closeDrawer = () => setDrawerOpen(false);

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
    <div className="flex-1 pt-14 sm:pt-16 lg:pt-12">
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
          "flex flex-col gap-4 w-full max-w-64 bg-white fixed left-0 top-0 z-50 h-full pt-6 px-5 transition-transform duration-200 ease-out lg:hidden shadow-lg border-r border-[#E5E7EB]",
          {
            "-translate-x-full": !drawerOpen,
            "translate-x-0": drawerOpen,
          },
        )}
      >
        <div className="flex items-center justify-between mb-2">
          <p className="font-semibold font-helvetica text-primary text-lg">
            Blivap
          </p>
          <button
            onClick={closeDrawer}
            className="p-1.5 hover:bg-[#F3F4F6] rounded-md transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
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
                  "text-sm text-[#374151] py-2.5 px-3 rounded-md font-medium",
                  active
                    ? "bg-[#F5F3FF] text-primary"
                    : "hover:bg-[#F9FAFB] hover:text-primary",
                )}
              >
                {e.label}
              </Link>
            );
          })}
        </div>
        <div className="flex flex-col gap-3 mt-2 pt-4 border-t border-[#E5E7EB]">
          <Link
            href="/about"
            onClick={closeDrawer}
            className="text-sm font-medium text-[#374151] hover:text-primary transition-colors"
          >
            About Blivap
          </Link>
          <div className="flex items-center gap-2 text-xs font-medium text-[#6B7280]">
            <span className="flex items-center gap-1">
              <Globe size={14} strokeWidth={1.5} /> NL
            </span>
            <span>|</span>
            <span>EN</span>
          </div>
        </div>
      </div>

      {/* Top Navigation Bar */}
      <div className="fixed top-0 z-40 bg-[#F4F2FF] pb-2 lg:pb-0  pt-4  flex justify-center items-center px-4 sm:px-6 md:px-8 lg:px-20 min-[1441px]:px-36 w-full">
        <div className="flex items-center justify-between w-full max-w-[1140px] min-[1441px]:max-w-[1440px]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen((prev) => !prev)}
              className="p-1 bg-[#F9FAFB] border border-[#E5E7EB] rounded-md h-fit lg:hidden hover:bg-[#F3F4F6] transition-colors"
              aria-label="Toggle menu"
            >
              <Menu size={16} />
            </button>

            <div className="hidden lg:flex gap-1">
              {navItems.map((e) => {
                const active = isActive(e.href);
                return (
                  <Link
                    key={`nav-link-${e.label}`}
                    href={e.href}
                    className={classNames(
                      "text-sm font-medium pt-2 pb-3 px-3 rounded-t-md transition-colors text-black duration-200",
                      active
                        ? "bg-white  "
                        : "text-[#374151] hover:bg-white/60 ",
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
                "text-sm font-medium text-black  transition-colors hidden sm:inline hover:bg-white/60 pt-2 pb-3 px-3 rounded-t-md",
                {
                  "bg-white": isActive("/about"),
                },
              )}
            >
              About
            </Link>
            <div className="flex items-center gap-2 text-xs font-medium text-[#6B7280]">
              <span className="flex items-center gap-1">
                <Globe size={14} strokeWidth={1.5} /> NL
              </span>
              <span>|</span>
              <span>EN</span>
            </div>
          </div>
        </div>
      </div>
      {props.children}
      <div className="bg-black px-4 sm:px-6 md:px-8 lg:px-20 min-[1441px]:px-36">
        <div className="relative mt-6 sm:mt-8 md:mt-12 max-w-[1440px] mx-auto flex flex-col gap-6 sm:gap-8 pt-6 sm:pt-8 px-4 sm:px-6 md:px-12 lg:px-20 pb-6 sm:pb-8 ">
          <p className="font-bold font-helvetica text-4xl text-primary ">
            Blivap
          </p>
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
            className={classNames(
              "absolute hidden sm:flex flex-col gap-3 -top-16 sm:-top-20 right-4 sm:right-6 md:right-12 lg:right-20 bg-white border border-[#E5E7EB] rounded-lg shadow-lg max-w-[20rem] px-4 py-3 transition-opacity duration-500 ease-in-out",
              bannerVisible
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none",
            )}
          >
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setBannerVisible(false);
              }}
              className="absolute top-2 right-2 p-1 rounded-full text-[#6B7280] hover:bg-[#E5E7EB] hover:text-black transition-colors"
              aria-label="Close banner"
            >
              <X size={16} />
            </button>
            <div className="flex flex-col gap-1.5">
              <p className="font-semibold text-sm text-black leading-snug">
                Save lives and earn with your blood or sperm
              </p>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                We connect donors with those in need.
              </p>
            </div>
            <Link
              href="/book-demo"
              className="w-full sm:w-fit text-white text-xs font-medium py-2 px-3.5 bg-primary hover:bg-primary/90 rounded-md inline-block text-center transition-colors mt-1"
            >
              Register as a donor
            </Link>
          </div>
        </div>
      </div>
      <div className="flex bg-[#171717] px-4 sm:px-6 md:px-8 lg:px-20 min-[1441px]:px-36">
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
