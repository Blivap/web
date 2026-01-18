"use client";

import classNames from "classnames";
import { Globe, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren, useState } from "react";

export const HomeLayout = (props: PropsWithChildren<unknown>) => {
  const pathName = usePathname();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathName === "/";
    return pathName.includes(href);
  };

  const closeDrawer = () => setDrawerOpen(false);

  const navItems = [
    { href: "/", label: "Donors" },
    { href: "/researchers", label: "Researchers" },
    {
      href: "/healthcare&professionals",
      label: "Healthcare professionals",
    },
    {
      href: "/working_at",
      label: "Working at",
    },
  ];

  return (
    <div className="flex-1 pt-16 sm:pt-20 lg:pt-14.25">
      {/* Overlay for tablet/mobile when drawer is open */}
      <div
        onClick={closeDrawer}
        className={classNames(
          "fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ease-in-out",
          {
            "opacity-100 pointer-events-auto": drawerOpen,
            "opacity-0 pointer-events-none": !drawerOpen,
          }
        )}
      />

      {/* Drawer/Sidebar */}
      <div
        className={classNames(
          "flex flex-col gap-6 w-full max-w-70 bg-white fixed left-0 top-0 z-50 h-full pt-8 px-6 transition-transform duration-200 ease-out lg:hidden shadow-lg",
          {
            "-translate-x-full": !drawerOpen,
            "translate-x-0": drawerOpen,
          }
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="font-bold font-helvetica text-primary text-2xl">
            Blivap
          </p>
          <button
            onClick={closeDrawer}
            className="p-2 hover:bg-gray-100 rounded-md"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {navItems.map((e) => {
            const active = isActive(e.href);
            return (
              <Link
                key={`drawer-link-${e.label}`}
                href={e.href}
                onClick={closeDrawer}
                className={classNames(
                  "text-base text-[#171717] py-2.5 px-3.75 font-inter",
                  { "bg-white": active }
                )}
              >
                {e.label}
              </Link>
            );
          })}
        </div>
        <div className="flex flex-col gap-4 mt-4 pt-4 border-t border-gray-200">
          <Link
            href="/about"
            onClick={closeDrawer}
            className="font-inter text-base text-[#171717] hover:text-primary"
          >
            About Blivap
          </Link>
          <div className="flex items-center font-inter">
            <p className="font-semibold flex gap-1 items-center">
              <Globe size={20} strokeWidth={1.5} /> <span> NL</span>
            </p>
            <p className="mx-2.5">|</p>
            <p className="font-semibold"> EN </p>
          </div>
        </div>
      </div>

      {/* Top Navigation Bar */}
      <div className="fixed top-0 z-40 bg-[#F4F2FF] py-3 sm:py-4 lg:pb-0 flex justify-between items-center px-4 sm:px-6 md:px-8 lg:px-20 w-full">
        <div className="flex items-center gap-4">
          {/* Hamburger menu button for tablet/mobile */}
          <button
            onClick={() => setDrawerOpen((prev) => !prev)}
            className="p-2 bg-white rounded-md shadow-md h-fit lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex gap-5.75">
            {navItems.map((e) => {
              const active = isActive(e.href);
              return (
                <Link
                  key={`nav-link-${e.label}`}
                  href={e.href}
                  className={classNames(
                    "text-base text-[#171717] py-2.5 px-3.75 font-inter",
                    { "bg-white": active }
                  )}
                >
                  {e.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right side - About Blivap and Language */}
        <div className="flex gap-5.25">
          <Link href="/about" className=" font-inter">
            About Blivap
          </Link>

          <div className="flex items-center font-inter">
            <p className="font-semibold flex gap-1  items-center text-sm sm:text-base">
              <Globe size={20} strokeWidth={1.5} /> <span> NL</span>
            </p>
            <p className="mx-2.5">|</p>
            <p className="font-semibold"> EN </p>
          </div>
        </div>
      </div>
      {props.children}
      <div className="relative mt-8 sm:mt-12 md:mt-63.75 bg-black flex flex-col gap-8 sm:gap-12 md:gap-14.25 pt-8 sm:pt-12 md:pt-13.75 px-4 sm:px-6 md:px-12 lg:px-20.25 pb-8 sm:pb-12 md:pb-14.25">
        <p className="font-bold font-helvetica text-xl sm:text-2xl md:text-[32px] leading-5.5 text-white tracking-[-0.41px]">
          Blivap
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-0 md:flex md:justify-between">
          {[
            {
              title: "Knowledge",
              items: [
                "Giving blood",
                "About blood",
                "About Sperm",
                "our expertise",
              ],
            },
            { title: "Our audiences", items: ["Health care", "Donors"] },
            { title: "About Blivap", items: ["News", "Education"] },
            {
              title: "Service & Contract",
              items: ["Frequently asked question", "Contact us"],
            },
          ].map((section, i) => (
            <div key={i} className="flex flex-col gap-3 sm:gap-4 md:gap-5">
              <p className="font-semibold text-sm sm:text-base md:text-[18px] text-white tracking-[-0.41px]">
                {section.title}
              </p>
              {section.items.map((item, j) => (
                <p
                  key={j}
                  className="text-xs sm:text-sm md:text-base text-white tracking-[-0.41px] cursor-pointer hover:text-primary transition-colors"
                >
                  {item}
                </p>
              ))}
            </div>
          ))}
        </div>
        <div className="absolute hidden  -top-20 sm:-top-24 md:-top-28 right-4 sm:right-6 md:right-12 lg:right-20.25 bg-[#F4F2FF] sm:flex flex-col gap-4 sm:gap-5 md:gap-6.25 shadow-[0px_0px_20px_#00000040] max-w-full sm:max-w-md md:max-w-132 px-4 sm:px-5 md:px-6 py-3 sm:py-3.5">
          <div className="flex flex-col gap-2 sm:gap-3 md:gap-3.5">
            <p className="font-medium text-base sm:text-lg md:text-xl leading-5.5">
              Save lives and earn money with your blood or spam
            </p>
            <p className="text-sm sm:text-base tracking-[-0.41px] text-[#333333]">
              With your blood and spam we save and improve lives
            </p>
          </div>
          <Link
            href="#"
            className="w-full sm:w-fit text-white text-sm sm:text-base py-2.5 sm:py-3.5 px-4 sm:px-[17.7px] bg-primary hover:bg-primary/90 transition-colors inline-block text-center"
          >
            Register as a donor
          </Link>
        </div>
      </div>
      <div className="bg-[#171717] flex flex-col sm:flex-row py-6 sm:py-8 gap-4 sm:gap-6 md:gap-11 px-4 sm:px-6 md:px-12 lg:pl-20.25">
        {[
          "coordinated Vulnerability Disclosure",
          "Privacy & Cookies",
          "Terms and conditions",
        ].map((text, i) => (
          <p
            key={i}
            className="text-white cursor-pointer hover:text-primary transition-colors text-xs sm:text-sm md:text-base"
          >
            {text}
          </p>
        ))}
      </div>
    </div>
  );
};
