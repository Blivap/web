"use client";
import {
  DashBoardIcon,
  WalletIcon,
  DonorsIcon,
  HistoryIcon,
  SettingsIcon,
  ModeIcon,
  MoonIcon,
  SunIcon,
} from "@/public/icons";
import classNames from "classnames";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren, useState, ReactElement } from "react";
import { Avatar } from "../Avatar/avatar.component";
import { FaBars } from "react-icons/fa";
import { FiBell } from "react-icons/fi";

// Define navigation item structure
interface NavItem {
  title: string;
  href: string;
  icon: (props: { color?: string; className?: string }) => ReactElement;
  // Optional: custom colors for active/inactive states
  activeColor?: string;
  inactiveColor?: string;
}
export const Layout = (props: PropsWithChildren<unknown>) => {
  const [drawer, setDrawer] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const closeDrawer = () => setDrawer(false);

  return (
    <div className="flex-1 bg-[#f8f8f8] w-full overflow-scroll">
      {/* Overlay for mobile when drawer is open */}

      <div
        onClick={closeDrawer}
        className={classNames(
          "fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ease-in-out",
          {
            "opacity-100 pointer-events-auto": drawer,
            "opacity-0 pointer-events-none": !drawer,
          }
        )}
      />

      {/* Sidebar */}
      <div
        className={classNames(
          "flex flex-col gap-[43px] w-full max-w-[230px] md:max-w-[292px] bg-white fixed left-0 h-full pt-8 px-4 md:pl-8 transition-transform duration-200 ease-out z-50",
          {
            // On mobile: completely hidden when closed (-translate-x-full), visible when open (translate-x-0)
            // On desktop: always visible (md:translate-x-0 overrides)
            "-translate-x-full md:translate-x-0": !drawer,
            "translate-x-0": drawer,
          }
        )}
      >
        <p className="font-bold text-primary text-[32px] font-helvetica">
          Blivap
        </p>
        <NavLinks onLinkClick={closeDrawer} />
        <div className="flex flex-col gap-[22px]">
          <p className="font-bold text-xs uppercase text-foundation-dark">
            Other
          </p>
          <div className="flex items-center font-medium text-base gap-4 transition-colors duration-200 text-foundation-dark">
            <ModeIcon color="#070416" />
            <span>{isDarkMode ? "Dark Mode" : "Light Mode"}</span>
            <ToggleSwitch checked={isDarkMode} onChange={setIsDarkMode} />
          </div>
        </div>
      </div>
      {/* Topbar */}
      <div className="fixed top-0 left-0 right-0 md:left-[292px] z-30 bg-[#f8f8f8]/80 ">
        <div className="w-full py-3.5 px-5 md:px-9 flex items-center justify-between ">
          <div className="flex items-center md:w-full justify-between gap-4">
            <div className="flex items-center gap-2 order-2 md:order-1">
              <Avatar className="sm:size-12! size-9!" />
              <div className="flex flex-col sm:gap-1">
                <p className="text-[#000000] font-medium">648382</p>
                <p className="text-xs text-[#6B7280]">Donor</p>
              </div>
            </div>
            <div className="relative border-[0.5px] border-[#9CA3AF] rounded-full sm:p-4 p-1 flex items-center justify-center order-1 md:order-2">
              <div className="absolute size-[7.5px] bg-[#FF0000] rounded-full right-2 top-1 sm:top-4 sm:right-4.5" />
              <FiBell size={24} className="stroke-2 text-2xl" />
            </div>
          </div>
          <button
            onClick={() => setDrawer((prev) => !prev)}
            className="p-2.5 sm:p-3 bg-white rounded-md shadow-md h-fit md:hidden"
            aria-label="Toggle menu"
          >
            <FaBars size={16} />
          </button>
        </div>
      </div>
      {/* Main content area */}
      <div className="relative flex flex-col gap-6 md:ml-[292px] m-5 pt-20 sm:px-8 h-full">
        {props.children}
      </div>
    </div>
  );
};

// Toggle Switch Component
interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const ToggleSwitch = ({ checked, onChange }: ToggleSwitchProps) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative inline-flex justify-between items-center gap-2 p-2 rounded-full bg-[#F3F2F3] w-[52px] h-[30px]"
    >
      {/* Sliding background circle */}
      <span
        className={classNames(
          "absolute inline-block h-[22px] w-[22px] rounded-full bg-white transition-all duration-200 ease-in-out",
          {
            "translate-x-[23px]": checked, // Moves from left (3.5px) to right position
            "translate-x-0": !checked,
          }
        )}
        style={{ left: "3.5px" }}
      />
      {/* Icons with z-index to appear above sliding background */}
      <SunIcon className="size-3.5 relative z-10" />
      <MoonIcon className="relative z-10" />
    </button>
  );
};

interface NavLinksProps {
  onLinkClick?: () => void;
}

const NavLinks = ({ onLinkClick }: NavLinksProps) => {
  const pathName = usePathname();

  // Define navigation items with their icons and optional custom colors
  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "dashboard",
      icon: DashBoardIcon,
      // Optional: customize colors per route
      activeColor: "#960018", // Primary color when active
      inactiveColor: "#070416", // Foundation dark when inactive
    },
    {
      title: "Wallet",
      href: "wallet",
      icon: WalletIcon,
      activeColor: "#960018",
      inactiveColor: "#070416",
    },
    {
      title: "Active Donors",
      href: "active_donors",
      icon: DonorsIcon,
      activeColor: "#960018",
      inactiveColor: "#070416",
    },
    {
      title: "History",
      href: "history",
      icon: HistoryIcon,
      activeColor: "#960018",
      inactiveColor: "#070416",
    },
    {
      title: "Settings",
      href: "settings",
      icon: SettingsIcon,
      activeColor: "#960018",
      inactiveColor: "#070416",
    },
  ];

  // Helper function to check if a route is active
  const isActive = (href: string) => {
    return pathName.includes(href);
  };

  return (
    <div className="flex flex-col gap-6">
      {navItems.map((item, idx) => {
        const active = isActive(item.href);
        // Determine icon color: use custom colors if provided, otherwise use defaults
        const iconColor = active
          ? item.activeColor || "#960018"
          : item.inactiveColor || "#070416";

        // Get the icon component
        const IconComponent = item.icon;

        return (
          <Link
            key={`link-${idx}`}
            href={`/${item.href}`}
            onClick={onLinkClick}
            className={classNames(
              "flex items-center font-medium text-base gap-4 transition-colors duration-200",
              {
                "text-primary font-bold!": active,
                "text-foundation-dark": !active,
              }
            )}
          >
            <IconComponent color={iconColor} />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </div>
  );
};
