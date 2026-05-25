"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

const TabsRoot = TabsPrimitive.Root;

type UrlSyncedTabsProps = Omit<
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>,
  "dir"
> & {
  /**
   * When set, tab changes are mirrored into this query key.
   * Example: queryKey="tab" -> ?tab=pending|confirmed|past
   */
  queryKey?: string;
  /**
   * Optional allowlist when reading the tab value from the query.
   * If the query value is missing or not listed, `defaultValue` is used.
   */
  queryValues?: readonly string[];
  /**
   * When the active tab equals this value, `queryKey` is removed from the URL
   * instead of being set (cleaner default tab URLs).
   */
  omitSearchParamWhenValue?: string;
};

/**
 * Radix Tabs root with optional Next.js search-param sync (bookings, overview, etc.).
 * Without `queryKey`, behaves like a normal controlled/uncontrolled `Tabs` root.
 */
function Tabs({
  queryKey,
  queryValues,
  omitSearchParamWhenValue,
  defaultValue,
  value: valueProp,
  onValueChange,
  className,
  ...props
}: UrlSyncedTabsProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const fallbackTab = (
    defaultValue !== undefined && defaultValue !== "" ? defaultValue : "pending"
  ) as string;

  let urlTab = fallbackTab;
  if (queryKey) {
    const raw = searchParams.get(queryKey);
    if (raw && raw !== "" && (!queryValues || queryValues.includes(raw))) {
      urlTab = raw;
    }
  }

  const [optimisticTab, setOptimisticTab] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (optimisticTab !== null && optimisticTab === urlTab) {
      setOptimisticTab(null);
    }
  }, [optimisticTab, urlTab]);

  const [localTab, setLocalTab] = React.useState(fallbackTab);

  React.useEffect(() => {
    if (!queryKey) {
      setLocalTab(fallbackTab);
    }
  }, [fallbackTab, queryKey]);

  const resolvedValue =
    valueProp !== undefined && valueProp !== null
      ? valueProp
      : queryKey
        ? optimisticTab !== null && optimisticTab !== urlTab
          ? optimisticTab
          : urlTab
        : localTab;

  const handleValueChange = (nextValue: string) => {
    onValueChange?.(nextValue);

    if (queryKey) {
      setOptimisticTab(nextValue);
      const querySource =
        typeof window !== "undefined"
          ? window.location.search
          : `?${searchParams.toString()}`;
      const params = new URLSearchParams(
        querySource.startsWith("?") ? querySource.slice(1) : querySource,
      );
      if (
        omitSearchParamWhenValue !== undefined &&
        nextValue === omitSearchParamWhenValue
      ) {
        params.delete(queryKey);
      } else {
        params.set(queryKey, nextValue);
      }
      const query = params.toString();
      const url = query ? `${pathname}?${query}` : pathname;
      void router.replace(url, { scroll: false });
      return;
    }

    setLocalTab(nextValue);
  };

  return (
    <TabsPrimitive.Root
      className={cn("group/tabs flex flex-col gap-2", className)}
      data-slot="tabs"
      value={resolvedValue}
      onValueChange={handleValueChange}
      {...props}
    />
  );
}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    data-slot="tabs-list"
    className={cn(
      "inline-flex h-9 w-fit items-center justify-center rounded-lg bg-muted p-[3px] text-muted-foreground",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    data-slot="tabs-trigger"
    className={cn(
      "inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm dark:text-muted-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 dark:data-[state=active]:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    data-slot="tabs-content"
    className={cn(
      "flex-1 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent, TabsRoot };
export type { UrlSyncedTabsProps };
