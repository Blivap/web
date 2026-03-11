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
import {
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
  ReactElement,
} from "react";
import gsap from "gsap";
import { Avatar } from "../Avatar/avatar.component";
import { FaBars } from "react-icons/fa";
import { useLogout } from "@/app/hooks/auth/useLogout.hook";
import { useDashboard } from "@/app/hooks/dashboard/useDashboard.hook";
import { NotificationBell } from "../notification/notification.component";
import { ChevronDown, LogOut, Settings } from "lucide-react";

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
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { handleLogout } = useLogout();
  const closeDrawer = () => setDrawer(false);
  const { user } = useDashboard();
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isProfileMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileContainerRef.current &&
        !profileContainerRef.current.contains(e.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileMenuOpen]);

  useEffect(() => {
    const el = profileMenuRef.current;
    if (!el) return;
    if (isProfileMenuOpen) {
      el.style.visibility = "visible";
      gsap.to(el, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.2,
        ease: "power2.out",
        overwrite: true,
      });
    } else {
      gsap.to(el, {
        opacity: 0,
        scale: 0.96,
        y: -6,
        duration: 0.15,
        ease: "power2.in",
        overwrite: true,
        onComplete: () => {
          if (el) el.style.visibility = "hidden";
        },
      });
    }
  }, [isProfileMenuOpen]);

  return (
    <div className=" bg-[#f8f8f8]  h-screen grow flex ">
      {/* Overlay for mobile when drawer is open */}

      <div
        onClick={closeDrawer}
        className={classNames(
          "fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ease-in-out",
          {
            "opacity-100 pointer-events-auto": drawer,
            "opacity-0 pointer-events-none": !drawer,
          },
        )}
      />

      {/* Sidebar */}
      <div
        className={classNames(
          "flex flex-col gap-10 w-full max-w-[230px] md:max-w-[252px] bg-white border-r border-[#DADADA] fixed left-0 h-full pt-8 px-4 md:pl-8 transition-transform duration-200 ease-out z-50",
          {
            // On mobile: completely hidden when closed (-translate-x-full), visible when open (translate-x-0)
            // On desktop: always visible (md:translate-x-0 overrides)
            "-translate-x-full md:translate-x-0": !drawer,
            "translate-x-0": drawer,
          },
        )}
      >
        <p className="font-bold text-primary text-3xl font-helvetica">Blivap</p>
        <NavLinks onLinkClick={closeDrawer} />
        <div className="flex flex-col gap-5">
          <p className="font-bold text-xs uppercase text-foundation-dark">
            Other
          </p>
          <div className="flex items-center font-medium text-sm gap-4 transition-colors duration-200 text-foundation-dark">
            <ModeIcon color="#070416" />
            <span>{isDarkMode ? "Dark Mode" : "Light Mode"}</span>
            <ToggleSwitch checked={isDarkMode} onChange={setIsDarkMode} />
          </div>
        </div>
      </div>
      {/* Topbar */}
      <div className="fixed top-0 left-0 right-0 md:left-[252px] z-30 bg-white border-b border-[#DADADA] ">
        <div className="w-full py-3.5 px-5 md:px-9 flex items-center justify-between ">
          <div className="flex items-center md:w-full justify-between gap-4">
            <div
              ref={profileContainerRef}
              className="relative flex items-center gap-3 order-2 md:order-1"
            >
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                className="flex items-center gap-3 cursor-pointer rounded-full border border-transparent hover:border-[#E5E7EB] pr-2 transition-colors"
              >
                <div
                  className="flex items-center gap-2"
                  key={user?.id || "no-user"}
                >
                  <Avatar
                    className="sm:size-10! size-9!"
                    src={user?.profileImage}
                  />
                  <div className="flex flex-col text-left">
                    <p className="text-[#000000] font-medium text-sm">
                      {user?.id?.slice(0, 6) ?? "User"}
                    </p>
                    <p className="text-xs text-[#6B7280]">Donor</p>
                  </div>
                </div>
                <ChevronDown
                  size={16}
                  className={classNames("transition-transform duration-200", {
                    "rotate-180": isProfileMenuOpen,
                  })}
                />
              </button>
              <div
                ref={profileMenuRef}
                className={classNames(
                  "absolute top-full left-0 md:left-auto md:-right-20 mt-3 w-[220px] bg-white z-20 rounded-xl border border-[#DADADA] shadow-[2px_4px_10px_#00000014] p-2 origin-top-right ",
                  isProfileMenuOpen
                    ? "pointer-events-auto"
                    : "pointer-events-none",
                )}
                style={{
                  visibility: "hidden",
                  opacity: 0,
                  transform: "translateY(-6px) scale(0.96)",
                }}
              >
                <div className="px-3 py-2 border-b border-[#F3F4F6]">
                  <p className="text-sm font-medium text-black">
                    {user?.id?.slice(0, 6) ?? "User"}
                  </p>
                  <p className="text-xs text-[#6B7280]">Donor account</p>
                </div>
                <div className="flex flex-col pt-2">
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-[#374151] hover:bg-[#F9FAFB] hover:text-primary transition-colors"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <Settings size={16} />
                    Settings
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-[#374151] hover:bg-[#F9FAFB] hover:text-primary transition-colors text-left"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            </div>
            <NotificationBell />
          </div>
          <button
            onClick={() => setDrawer((prev) => !prev)}
            className="p-2 sm:p-3 bg-white rounded-md shadow-md h-fit md:hidden"
            aria-label="Toggle menu"
          >
            <FaBars size={12} />
          </button>
        </div>
      </div>
      {/* Main content area */}
      <div className="relative flex flex-col gap-6 md:ml-[252px] m-2 md:m-2 pt-[74px] md:pl-2  flex-1 overflow-hidden ">
        <div className="flex-1 bg-white overflow-y-auto p-4 rounded border border-[#DADADA] no-scrollbar overflow-scroll">
          {props.children}
        </div>
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
      className="relative inline-flex justify-between items-center gap-2 p-2 rounded-full bg-[#F3F2F3] w-14 h-8"
    >
      {/* Sliding background circle */}
      <span
        className={classNames(
          "absolute inline-block h-5 w-5 rounded-full bg-white transition-all duration-200 ease-in-out",
          {
            "translate-x-[23px]": checked, // Moves from left (3.5px) to right position
            "translate-x-0": !checked,
          },
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
      title: "Overview",
      href: "overview",
      icon: DashBoardIcon,
      // Optional: customize colors per route
      activeColor: "#960018", // Primary color when active
      inactiveColor: "#070416", // Foundation dark when inactive
    },
    {
      title: "Donors",
      href: "donors",
      icon: DonorsIcon,
      activeColor: "#960018",
      inactiveColor: "#070416",
    },
    {
      title: "Wallet",
      href: "wallet",
      icon: WalletIcon,
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
              "flex items-center font-medium text-sm gap-4 transition-colors duration-200",
              {
                "text-primary font-bold!": active,
                "text-foundation-dark": !active,
              },
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
