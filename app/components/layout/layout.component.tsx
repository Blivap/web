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

  return (
    <div className="flex-1 bg-[#f8f8f8]">
      <div
        className={classNames(
          "flex flex-col gap-[73px] w-1/2  max-w-[292px] bg-white fixed left-0  h-full pt-[49px] pl-8 transition-all duration-200 ease-out",
          { "-left-80!": drawer }
        )}
      >
        <p className="font-bold text-primary text-[32px] font-helvetica">
          Blivap
        </p>
        <NavLinks />
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
      <div
        onClick={() => setDrawer((prev) => !prev)}
        className="md:ml-[292px] p-8"
      >
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

const NavLinks = () => {
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
