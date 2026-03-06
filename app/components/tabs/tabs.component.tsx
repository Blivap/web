"use client";

import classNames from "classnames";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Children,
  isValidElement,
  ReactElement,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";

const TAB_QUERY_KEY = "tab";

export interface TabItemProps {
  label: string;
  children: ReactNode;
}

/**
 * Single tab: provides label for the tab button and content when active.
 * Used only as a child of Tabs.
 */
export function TabItem({ children }: TabItemProps) {
  return <>{children}</>;
}

TabItem.displayName = "TabItem";

function isTabItemElement(
  child: ReactNode,
): child is ReactElement<TabItemProps> {
  return isValidElement(child) && child.type === TabItem;
}

export interface TabsProps {
  /** TabItem elements. Active panel is switched by index. */
  children: ReactNode;
  /** Initial active tab index (default 0). */
  defaultTabValue?: string;
  /** Optional class for the wrapper */
  className?: string;
  /** Optional class for the nav element */
  navClassName?: string;
  /** Optional class for each tab button */
  tabClassName?: string;
  /** Optional class for the active panel wrapper */
  panelClassName?: string;
}

/**
 * Reusable tabs: maps over TabItem children, renders tab buttons by index,
 * and shows the panel for the active index. No route or query — pure component state.
 */
export function Tabs({
  children,
  defaultTabValue,
  className,
  navClassName,
  tabClassName,
  panelClassName,
}: TabsProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const items = useMemo(
    () =>
      Children.toArray(children).filter(
        isTabItemElement,
      ) as ReactElement<TabItemProps>[],
    [children],
  );

  const defaultLower = (defaultTabValue ?? items[0]?.props.label ?? "").toLowerCase();

  const tabValueFromQuery = (() => {
    const t = searchParams.get(TAB_QUERY_KEY);
    if (t === null || t === "") return defaultLower;
    const lower = t.toLowerCase();
    const match = items.find((item) => item.props.label.toLowerCase() === lower);
    return match ? match.props.label.toLowerCase() : defaultLower;
  })();

  const [activeTabValue, setActiveTabValue] = useState(tabValueFromQuery);

  useEffect(() => {
    setActiveTabValue(tabValueFromQuery);
  }, [tabValueFromQuery]);

  const activeItem = items.find(
    (item) => item.props.label.toLowerCase() === activeTabValue,
  );

  const setTab = (label: string) => {
    const valueLower = label.toLowerCase();
    setActiveTabValue(valueLower);
    const params = new URLSearchParams(searchParams.toString());
    if (valueLower === defaultLower) {
      params.delete(TAB_QUERY_KEY);
    } else {
      params.set(TAB_QUERY_KEY, valueLower);
    }
    const query = params.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    router.replace(url, { scroll: false });
  };

  return (
    <div className={className}>
      <nav
        className={classNames(
          "flex gap-6 border-b border-[#E5E7EB]",
          navClassName,
        )}
        role="tablist"
      >
        {items.map((item, index) => {
          const isActive = item.props.label.toLowerCase() === activeTabValue;
          return (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setTab(item.props.label)}
              className={classNames(
                "pb-3 text-sm font-medium transition-colors",
                isActive
                  ? "text-black border-b-2 border-black"
                  : "text-[#6B7280] hover:text-black",
                tabClassName,
              )}
            >
              {item.props.label}
            </button>
          );
        })}
      </nav>
      {activeItem && (
        <div className={panelClassName} role="tabpanel">
          {activeItem.props.children}
        </div>
      )}
    </div>
  );
}
