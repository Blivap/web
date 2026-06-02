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
  useState,
  ReactElement,
} from "react";
import { useDashboard } from "@/hooks/dashboard/useDashboard.hook";
import { NotificationBell } from "../components/feedback/notification/notification.component";
import { PushNotificationRegistrar } from "../components/feedback/notification/push-registrar.component";
import { useNotificationNavigationListener } from "@/hooks/notifications/useNotificationNavigationListener.hook";
import { Info, Menu } from "lucide-react";
import { routes } from "@/config/routes";
import { useThemePreference } from "@/hooks/theme/useThemePreference.hook";
import { SelectAvatarModal } from "@/components/select-avatar/select-avatar-modal.component";
import { ProfileAccountMenu } from "./profile-account-menu.component";
import { Button } from "@/components/button/button.component";
import { BlivapLogo } from "@/public/svg";
import { LayoutBreadcrumbs } from "./layout-breadcrumbs.component";

// Define navigation item structure
interface NavItem {
  title: string;
  href: string;
  icon: (props: { color?: string; className?: string }) => ReactElement;
  // Optional: custom colors for active/inactive states
  activeColor?: string;
  inactiveColor?: string;
  /** Non-clickable nav row with an "Upcoming" badge */
  upcoming?: boolean;
}
export const Layout = (props: PropsWithChildren<unknown>) => {
  useNotificationNavigationListener();
  const [drawer, setDrawer] = useState(false);
  const { resolved, setPreference } = useThemePreference();
  const closeDrawer = () => setDrawer(false);
  const { user } = useDashboard();

  return (
    <div className="bg-[#f8f8f8] dark:bg-[#0a0a0a] h-screen grow flex transition-colors duration-200">
      <PushNotificationRegistrar />
      <SelectAvatarModal />
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
          "flex flex-col gap-10 w-full max-w-57.5 md:max-w-63 bg-white dark:bg-[#111118] border-r border-[#DADADA] dark:border-white/10 fixed left-0 h-full pt-4 px-4 md:pl-8 transition-transform duration-200 ease-out z-50",
          {
            // On mobile: completely hidden when closed (-translate-x-full), visible when open (translate-x-0)
            // On desktop: always visible (md:translate-x-0 overrides)
            "-translate-x-full md:translate-x-0": !drawer,
            "translate-x-0": drawer,
          },
        )}
      >
        <div className="relative z-100 hidden items-center justify-between gap-4 md:flex md:w-full">
          <ProfileAccountMenu className="order-2 w-full md:order-1" />
        </div>

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
        <p className="flex font-semibold font-helvetica text-primary text-6xl tracking-tight mt-auto mb-4">
          <BlivapLogo fill="#960018" className="size-18 -ml-2" />
          <span className="-mt-1 -ml-2">livap</span>
        </p>
      </div>
      {/* Topbar */}
      <div className="fixed top-0 left-0 right-0 md:left-63 z-60 bg-white dark:bg-[#111118] border-b border-[#DADADA] dark:border-white/10 transition-colors duration-200">
        <div className="flex w-full min-w-0 items-center justify-between gap-3 py-3.5 px-5 md:gap-4 md:px-9">
          <ProfileAccountMenu
            variant="compact"
            menuAlign="left"
            className="shrink-0 md:hidden"
          />
          <LayoutBreadcrumbs className="hidden min-w-0 flex-1 md:flex" />
          <div className="flex shrink-0 items-center gap-3">
            <NotificationBell />
            <Button
              variant="ghost"
              onClick={() => setDrawer((prev) => !prev)}
              className="h-fit rounded-md border border-[#E5E7EB] bg-[#F9FAFB] p-1 text-text-primary transition-colors hover:bg-[#F3F4F6] md:hidden dark:border-white/10 dark:bg-[#1A1A22] dark:text-white dark:hover:bg-white/8"
              aria-label="Toggle menu"
            >
              <Menu size={24} className="size-6" />
            </Button>
          </div>
        </div>
      </div>
      {/* Main content area */}
      <div className="relative flex flex-col gap-6 md:ml-63 m-2 md:m-2 pt-18.5 md:pl-2  flex-1 overflow-hidden ">
        <div className="flex-1 bg-white dark:bg-[#14141a] overflow-y-auto p-4 xl:px-7 rounded border border-[#DADADA] dark:border-white/10 no-scrollbar overflow-scroll transition-colors duration-200">
          {!user?.nationalIdentificationNumberVerified && (
            <div className="mb-10 flex gap-4 border-l-4 border-[#960018] bg-[#FFE2E2] p-4 dark:bg-red-950/35 dark:border-primary">
              <Info size={16} className="text-primary shrink-0" />
              <div className="flex flex-col gap-0.75">
                <p className="text-xs font-semibold text-primary uppercase">
                  Verify Your Identity to Continue
                </p>
                <p className="max-w-200 text-xs text-[#5A403F] dark:text-red-100/85">
                  To ensure safety and trust on our platform, you must verify
                  your identity using your National Identification Number (NIN)
                  before you can book donors or receive bookings.{" "}
                  <Link
                    href={routes.verifyId("")}
                    className="underline text-primary"
                  >
                    verify your account details.
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
      upcoming: true,
    },
    {
      title: "History",
      href: "history",
      icon: HistoryIcon,
      activeColor: "#960018",
      inactiveColor: "#070416",
      upcoming: true,
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
        const active = !item.upcoming && isActive(item.href);
        const iconColor = item.upcoming
          ? darkShell
            ? "#6b6b78"
            : "#9CA3AF"
          : active
            ? item.activeColor || "#960018"
            : darkShell
              ? "#c8c8d0"
              : item.inactiveColor || "#070416";

        const IconComponent = item.icon;

        if (item.upcoming) {
          return (
            <div
              key={`link-${idx}`}
              aria-disabled="true"
              className="flex cursor-not-allowed items-center gap-4 text-sm font-medium text-text-tertiary opacity-70"
            >
              <IconComponent color={iconColor} />
              <span className="min-w-0 flex-1">{item.title}</span>
              <span className="shrink-0 rounded-full border border-border bg-[#F4F4F5] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-tertiary dark:border-white/10 dark:bg-white/8">
                Upcoming
              </span>
            </div>
          );
        }

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
