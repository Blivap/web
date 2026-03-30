"use client";
import {
  DashBoardIcon,
  WalletIcon,
  DonorsIcon,
  BookingsIcon,
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
import { Avatar } from "../components/ui/Avatar/avatar.component";
import { FaBars } from "react-icons/fa";
import { useLogout } from "@/hooks/auth/useLogout.hook";
import { useDashboard } from "@/hooks/dashboard/useDashboard.hook";
import { NotificationBell } from "../components/feedback/notification/notification.component";
import { ChevronDown, Info, LogOut, Settings } from "lucide-react";
import { routes } from "@/config/routes";
import {
  nextThemePreference,
  useThemePreference,
} from "@/hooks/theme/useThemePreference.hook";
import { ProfileThemeCycleRow } from "./theme-profile-submenu.component";

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
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { preference, resolved, setPreference } = useThemePreference();
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
    <div className="bg-[#f8f8f8] dark:bg-[#0a0a0a] h-screen grow flex transition-colors duration-200">
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
          "flex flex-col gap-10 w-full max-w-57.5 md:max-w-63 bg-white dark:bg-[#111118] border-r border-[#DADADA] dark:border-white/10 fixed left-0 h-full pt-8 px-4 md:pl-8 transition-transform duration-200 ease-out z-50",
          {
            // On mobile: completely hidden when closed (-translate-x-full), visible when open (translate-x-0)
            // On desktop: always visible (md:translate-x-0 overrides)
            "-translate-x-full md:translate-x-0": !drawer,
            "translate-x-0": drawer,
          },
        )}
      >
        <p className="font-bold text-primary text-3xl font-helvetica dark:text-[#e8e8ea]">
          Blivap
        </p>
        <NavLinks onLinkClick={closeDrawer} darkShell={resolved === "dark"} />
        <div className="flex flex-col gap-5">
          <p className="font-bold text-xs uppercase text-foundation-dark dark:text-white/70">
            Other
          </p>
          <div className="flex items-center font-medium text-sm gap-4 transition-colors duration-200 text-foundation-dark dark:text-white/85">
            <ModeIcon color={resolved === "dark" ? "#c8c8d0" : "#070416"} />
            <span>{resolved === "dark" ? "Dark Mode" : "Light Mode"}</span>
            <ToggleSwitch
              checked={resolved === "dark"}
              onChange={(checked) => setPreference(checked ? "dark" : "light")}
            />
          </div>
        </div>
      </div>
      {/* Topbar */}
      <div className="fixed top-0 left-0 right-0 md:left-63 z-[60] bg-white dark:bg-[#111118] border-b border-[#DADADA] dark:border-white/10 transition-colors duration-200">
        <div className="w-full py-3.5 px-5 md:px-9 flex items-center justify-between ">
          <div className="flex items-center md:w-full justify-between gap-4">
            <div
              ref={profileContainerRef}
              className="relative flex items-center gap-3 order-2 md:order-1"
            >
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                className="flex items-center gap-3 cursor-pointer rounded-full border border-transparent hover:border-[#E5E7EB] dark:hover:border-white/15 pr-2 transition-colors"
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
                    <p className="text-[#000000] dark:text-white font-medium text-sm">
                      {user?.id?.slice(0, 6) ?? "User"}
                    </p>
                    <p className="text-xs text-[#6B7280] dark:text-white/55">
                      Donor
                    </p>
                  </div>
                </div>
                <ChevronDown
                  size={16}
                  className={classNames(
                    "text-[#374151] dark:text-white/80 transition-transform duration-200",
                    {
                      "rotate-180": isProfileMenuOpen,
                    },
                  )}
                />
              </button>
              <div className="absolute top-full left-0 z-[70] mt-3 origin-top-right md:left-auto md:right-auto">
                <div
                  ref={profileMenuRef}
                  className={classNames(
                    "relative w-55 bg-white dark:bg-[#1a1a22] rounded-xl border border-[#DADADA] dark:border-white/10 shadow-[2px_4px_10px_#00000014] dark:shadow-[2px_4px_24px_rgba(0,0,0,0.45)] p-2 transition-colors duration-200",
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
                  <div className="px-3 py-2 border-b border-[#F3F4F6] dark:border-white/10">
                    <p className="text-sm font-medium text-black dark:text-white">
                      {user?.id?.slice(0, 6) ?? "User"}
                    </p>
                    <p className="text-xs text-[#6B7280] dark:text-white/55">
                      Donor account
                    </p>
                  </div>
                  <div className="flex flex-col pt-2">
                    <ProfileThemeCycleRow
                      preference={preference}
                      onCycle={() =>
                        setPreference(nextThemePreference(preference))
                      }
                    />
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-[#374151] dark:text-white/85 hover:bg-[#F9FAFB] dark:hover:bg-white/[0.06] hover:text-primary transition-colors"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <Settings size={16} />
                      Settings
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-[#374151] dark:text-white/85 hover:bg-[#F9FAFB] dark:hover:bg-white/[0.06] hover:text-primary transition-colors text-left"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
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
      <div className="relative flex flex-col gap-6 md:ml-63 m-2 md:m-2 pt-18.5 md:pl-2  flex-1 overflow-hidden ">
        <div className="flex-1 bg-white dark:bg-[#14141a] overflow-y-auto p-4 xl:px-7 rounded border border-[#DADADA] dark:border-white/10 no-scrollbar overflow-scroll transition-colors duration-200">
          {!user?.nationalIdentificationNumberVerified && (
            <div className="mb-10 flex gap-4 border-l-4 border-[#960018] bg-[#FFE2E2] p-4 dark:bg-red-950/35 dark:border-primary">
              <Info size={16} className="text-primary" />
              <div className="flex flex-col gap-0.75">
                <p className="text-xs font-semibold text-primary uppercase">
                  Verify your account
                </p>
                <p className="max-w-200 text-xs text-[#5A403F] dark:text-red-100/85">
                  Please confirm your account to continue. Your information is
                  securely protected under medical confidentiality laws, and
                  accurate data helps ensure the safety of both donors and
                  recipients.{" "}
                  <Link
                    href={routes.verifyId("")}
                    className="underline text-primary"
                  >
                    to verify your account details.
                  </Link>
                </p>
              </div>
            </div>
          )}
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
      className="relative inline-flex h-8 w-14 items-center justify-between gap-2 rounded-full bg-[#F3F2F3] p-2 dark:bg-white/10"
    >
      {/* Sliding background circle */}
      <span
        className={classNames(
          "absolute inline-block h-5 w-5 rounded-full bg-white transition-all duration-200 ease-in-out dark:bg-[#2a2a32]",
          {
            "translate-x-5.75": checked, // Moves from left (3.5px) to right position
            "translate-x-0": !checked,
          },
        )}
        style={{ left: "3.5px" }}
      />
      {/* Icons with z-index to appear above sliding background */}
      <SunIcon className="relative z-10 size-3.5 text-amber-600 dark:text-amber-400" />
      <MoonIcon className="relative z-10 text-slate-600 dark:text-slate-300" />
    </button>
  );
};

interface NavLinksProps {
  onLinkClick?: () => void;
  darkShell?: boolean;
}

const NavLinks = ({ onLinkClick, darkShell }: NavLinksProps) => {
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
      title: "Bookings",
      href: routes.bookings.replace(/^\//, ""),
      icon: BookingsIcon,
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
          : darkShell
            ? "#c8c8d0"
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
                "text-foundation-dark dark:text-white/75": !active,
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
