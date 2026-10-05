"use client";

import type { ReactNode } from "react";
import { Layout } from "@/layout/layout.component";
import { SettingsNav } from "./settings-nav";

type SettingsShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function SettingsShell({
  title,
  description,
  children,
}: SettingsShellProps) {
  return (
    <Layout>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        <aside className="w-full shrink-0 lg:sticky lg:top-4 lg:w-72">
          <header className="mb-4 flex flex-col w-fit lg:mb-5">
            <h1 className="text-xl sm:text-2xl font-semibold text-primary">
              Settings
            </h1>
            <div className="mt-1 h-0.5 w-full bg-primary rounded-full" />
          </header>
          <SettingsNav />
        </aside>

        <div className="min-w-0 flex-1 flex flex-col gap-6">
          <header className="flex flex-col gap-1">
            <h2 className="text-lg sm:text-xl font-semibold text-[#100F14] dark:text-white/90">
              {title}
            </h2>
            {description ? (
              <p className="text-sm text-[#6B7280] dark:text-white/55">
                {description}
              </p>
            ) : null}
          </header>
          {children}
        </div>
      </div>
    </Layout>
  );
}
