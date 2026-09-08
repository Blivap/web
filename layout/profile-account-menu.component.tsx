"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import classNames from "classnames";
import { ChevronDown, LogOut, Settings } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar/avatar.component";
import { Button } from "@/components/button/button.component";
import { useLogout } from "@/hooks/auth/useLogout.hook";
import { useDashboard } from "@/hooks/dashboard/useDashboard.hook";
import {
  nextThemePreference,
  useThemePreference,
} from "@/hooks/theme/useThemePreference.hook";
import { ProfileThemeCycleRow } from "./theme-profile-submenu.component";

type ProfileAccountMenuProps = {
  /** Full row with name in sidebar; avatar-only in mobile topbar. */
  variant?: "full" | "compact";
  /** Dropdown alignment relative to trigger. */
  menuAlign?: "left" | "right";
  className?: string;
};

export function ProfileAccountMenu({
  variant = "full",
  menuAlign = "left",
  className,
}: ProfileAccountMenuProps) {
  const compact = variant === "compact";
  const [isOpen, setIsOpen] = useState(false);
  const { preference, setPreference } = useThemePreference();
  const { handleLogout } = useLogout();
  const { user } = useDashboard();
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        close();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, close]);

  useEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    if (isOpen) {
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
  }, [isOpen]);

  const displayName = user?.id?.slice(0, 6) ?? "User";

  return (
    <div
      ref={containerRef}
      className={classNames("relative flex items-center", className)}
    >
      <Button
        type="button"
        variant="ghost"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={compact ? "Account menu" : undefined}
        className={classNames(
          "flex h-auto items-center rounded-full border border-transparent hover:border-[#E5E7EB] dark:hover:border-white/15",
          compact
            ? "size-10 justify-center p-0"
            : "w-full justify-between gap-3 px-0 pr-2",
        )}
      >
        <div
          className={classNames("flex items-center", compact ? "" : "gap-2")}
          key={user?.id || "no-user"}
        >
          <Avatar
            className={compact ? "size-9!" : "sm:size-10! size-9!"}
            src={user?.profileImage}
          />
          {!compact ? (
            <div className="flex flex-col text-left">
              <p className="text-sm font-medium text-[#000000] dark:text-white">
                {displayName}
              </p>
              <p className="text-xs text-[#6B7280] dark:text-white/55">Donor</p>
            </div>
          ) : null}
        </div>
        {!compact ? (
          <ChevronDown
            size={16}
            className={classNames(
              "text-[#374151] transition-transform duration-200 dark:text-white/80",
              { "rotate-180": isOpen },
            )}
          />
        ) : null}
      </Button>

      <div
        className={classNames(
          "absolute top-full z-50 mt-3 origin-top",
          menuAlign === "right" ? "right-0" : "left-0",
          isOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <div
          ref={menuRef}
          role="menu"
          className={classNames(
            "relative w-65 rounded-xl border border-[#DADADA] bg-white p-2 shadow-[2px_4px_10px_#00000014] transition-colors duration-200 dark:border-white/10 dark:bg-[#1a1a22] dark:shadow-[2px_4px_24px_rgba(0,0,0,0.45)]",
            isOpen ? "pointer-events-auto" : "pointer-events-none",
          )}
          style={{
            visibility: "hidden",
            opacity: 0,
            transform: "translateY(-6px) scale(0.96)",
          }}
        >
          <div className="border-b border-[#F3F4F6] px-3 py-2 dark:border-white/10">
            <p className="text-sm font-medium text-black dark:text-white">
              {displayName}
            </p>
            <p className="text-xs text-[#6B7280] dark:text-white/55">
              Donor account
            </p>
          </div>
          <div className="flex flex-col pt-2">
            <ProfileThemeCycleRow
              preference={preference}
              onCycle={() => setPreference(nextThemePreference(preference))}
            />
            <Link
              href="/settings"
              role="menuitem"
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-[#374151] transition-colors hover:bg-[#F9FAFB] hover:text-primary dark:text-white/85 dark:hover:bg-white/6"
              onClick={close}
            >
              <Settings size={16} />
              Settings
            </Link>
            <Button
              type="button"
              variant="ghost"
              role="menuitem"
              onClick={handleLogout}
              className="h-auto w-full justify-start gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-[#374151] dark:text-white/85"
            >
              <LogOut size={16} />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
