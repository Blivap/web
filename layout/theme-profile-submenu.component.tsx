"use client";

import type { ThemePreference } from "@/hooks/theme/useThemePreference.hook";
import classNames from "classnames";
import { Monitor, Moon, Sun } from "lucide-react";

const rowSurfaceClass =
  "w-full rounded-lg px-3 py-2.5 text-left text-sm text-[#374151] transition-colors dark:text-white/85 hover:bg-[#F9FAFB] dark:hover:bg-white/6 hover:text-primary";

function preferenceLabel(preference: ThemePreference) {
  if (preference === "system") return "Auto";
  return preference === "dark" ? "Dark" : "Light";
}

function PreferenceIcon({ preference }: { preference: ThemePreference }) {
  if (preference === "light") return <Sun size={16} className="shrink-0" />;
  if (preference === "dark") return <Moon size={16} className="shrink-0" />;
  return <Monitor size={16} className="shrink-0" />;
}

type ProfileThemeCycleRowProps = {
  preference: ThemePreference;
  onCycle: () => void;
};

/**
 * Profile menu row: each click advances Auto → Dark → Light → Auto.
 * Theme applies immediately; menu stays open so the user can keep clicking.
 */
export function ProfileThemeCycleRow({
  preference,
  onCycle,
}: ProfileThemeCycleRowProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onCycle();
      }}
      title="Cycles theme: Auto → Dark → Light"
      aria-label={`Theme: ${preferenceLabel(preference)}. Activate to cycle to the next option.`}
      className={classNames(rowSurfaceClass, "flex flex-col gap-0.5")}
    >
      <span className="flex w-full items-center gap-2">
        <PreferenceIcon preference={preference} />
        <span className="min-w-0 flex-1 truncate">
          Theme: {preferenceLabel(preference)}
        </span>
      </span>
    </button>
  );
}
