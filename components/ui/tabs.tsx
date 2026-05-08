"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import classNames from "classnames";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type TabsProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> & {
  /**
   * When set, tab changes are mirrored into this query key.
   * Example: queryKey="tab" -> ?tab=active
   */
  queryKey?: string;
  /**
   * Optional allowlist used when reading the tab value from the query.
   * If the query value is not present here, `defaultValue` is used instead.
   */
  queryValues?: readonly string[];
};

function Tabs({
  queryKey,
  queryValues,
  defaultValue,
  value,
  onValueChange,
  ...props
}: TabsProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryValue = queryKey ? searchParams.get(queryKey) : null;
  const isAllowedQueryValue =
    queryValue !== null &&
    queryValue !== "" &&
    (!queryValues || queryValues.includes(queryValue));
  const resolvedValue =
    value ?? (isAllowedQueryValue ? queryValue : (defaultValue as string));

  const handleValueChange = (nextValue: string) => {
    onValueChange?.(nextValue);
    if (!queryKey) return;

    const params = new URLSearchParams(searchParams.toString());
    if (defaultValue !== undefined && nextValue === defaultValue) {
      params.delete(queryKey);
    } else {
      params.set(queryKey, nextValue);
    }

    const query = params.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    router.replace(url, { scroll: false });
  };

  return (
    <TabsPrimitive.Root
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
    className={classNames(
      "flex gap-6 border-b border-[#E5E7EB] dark:border-white/10",
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
    className={classNames(
      "pb-3 text-sm font-medium transition-colors",
      "text-text-secondary hover:text-text-primary",
      "data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary dark:data-[state=active]:text-primary",
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
  <TabsPrimitive.Content ref={ref} className={className} {...props} />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
