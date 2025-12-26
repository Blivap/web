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
      <div className="relative mt-8 sm:mt-12 md:mt-16 lg:mt-63.75 bg-black flex flex-col gap-6 sm:gap-8 md:gap-10 lg:gap-14.25 pt-6 sm:pt-8 md:pt-10 lg:pt-13.75 px-4 sm:px-6 md:px-8 lg:px-20.25 pb-6 sm:pb-8 md:pb-10 lg:pb-14.25">
        <p className="font-bold font-helvetica text-[32px] leading-5.5 text-white tracking-[-0.41px]">
          Blivap
        </p>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-10 justify-between">
          <div className="flex flex-col gap-5">
            <p className="font-semibold text-[18px] text-white tracking-[-0.41px]">
              Knowledge
            </p>
            <p className=" text-base text-white tracking-[-0.41px]">
              Giving blood
            </p>
            <p className=" text-base text-white tracking-[-0.41px]">
              About blood
            </p>
            <p className=" text-base text-white tracking-[-0.41px]">
              About Sperm
            </p>
            <p className=" text-base text-white tracking-[-0.41px]">
              our expertise
            </p>
          </div>
          <div className="flex flex-col gap-5">
            <p className="font-semibold text-[18px] text-white tracking-[-0.41px]">
              Our audiences
            </p>
            <p className=" text-base text-white tracking-[-0.41px]">
              Health care
            </p>
            <p className=" text-base text-white tracking-[-0.41px]">Donors</p>
          </div>
          <div className="flex flex-col gap-5">
            <p className="font-semibold text-[18px] text-white tracking-[-0.41px]">
              About Blivap
            </p>
            <p className=" text-base text-white tracking-[-0.41px]">News</p>
            <p className=" text-base text-white tracking-[-0.41px]">
              Education
            </p>
          </div>
          <div className="flex flex-col gap-5">
            <p className="font-semibold text-[18px] text-white tracking-[-0.41px]">
              Service & Contract
            </p>
            <p className=" text-base text-white tracking-[-0.41px]">
              Frequently asked question
            </p>
            <p className=" text-base text-white tracking-[-0.41px]">
              Contact us
            </p>
          </div>
        </div>
        <div className="absolute -top-20 sm:-top-24 lg:-top-28 right-4 sm:right-8 md:right-12 lg:right-20.25 bg-[#F4F2FF] md:flex flex-col gap-4 sm:gap-5 lg:gap-6.25 shadow-[0px_0px_20px_#00000040] max-w-full sm:max-w-96 lg:max-w-132 px-4 sm:px-5 lg:px-6 py-3 sm:py-3.5 hidden">
          <div className="flex flex-col gap-3.5">
            <p className="font-medium text-xl leading-5.5">
              Save lives and earn money with your blood or spam
            </p>
            <p className="text-base tracking-[-0.41px] text-[#333333]">
              With your blood and spam we save and improve lives
            </p>
          </div>
          <Link
            href="#"
            className="w-fit text-white text-base py-3.5 px-[17.7px] bg-primary"
          >
            Register as a donor
          </Link>
        </div>
      </div>
      <div className="bg-[#171717] gap-2 sm:gap-3 md:gap-6 lg:gap-11 px-4 sm:pl-5 md:pl-8 lg:pl-20.25 flex flex-wrap text-xs sm:text-sm md:text-base py-4 sm:py-6 md:py-8">
        <p className="text-white">coordinated Vulnerability Disclosure</p>
        <p className="text-white">Privacy & Cookies</p>
        <p className="text-white">Terms and conditions</p>
      </div>
    </div>
  );
};
