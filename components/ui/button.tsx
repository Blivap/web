import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { Slot } from "radix-ui";
import Link from "next/link";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 py-3.5 px-6",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground dark:hover:bg-primary/80 dark:hover:text-primary-foreground",
        primary:
          "bg-primary text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground dark:hover:bg-primary/80 dark:hover:text-primary-foreground",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "min-h-10 gap-1.5 px-3 py-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        xs: "min-h-8 gap-1 rounded-[min(var(--radius-md),10px)] px-2 py-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "min-h-9 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 py-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "min-h-11 gap-1.5 px-3 py-3.5 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

type ButtonAsButtonProps = ButtonVariantProps &
  Omit<React.ComponentProps<"button">, "className"> & {
    className?: string;
    href?: undefined;
    asChild?: boolean;
    loading?: boolean;
  };

type ButtonAsLinkProps = ButtonVariantProps &
  Omit<React.ComponentProps<"a">, "className"> & {
    className?: string;
    href: string;
    asChild?: never;
    loading?: boolean;
  };

type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

function buttonSpinnerIconClass(
  size: ButtonVariantProps["size"] | undefined,
): string {
  switch (size) {
    case "xs":
    case "icon-xs":
      return "size-3";
    case "sm":
    case "icon-sm":
      return "size-3.5";
    case "lg":
    case "icon-lg":
      return "size-4";
    default:
      return "size-4";
  }
}

function ButtonSpinner({
  size,
}: {
  size: ButtonVariantProps["size"] | undefined;
}) {
  return (
    <Loader2
      className={cn("animate-spin shrink-0", buttonSpinnerIconClass(size))}
      aria-hidden
    />
  );
}

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  loading = false,
  ...props
}: ButtonProps) {
  const iconOnlySize =
    size === "icon" ||
    size === "icon-xs" ||
    size === "icon-sm" ||
    size === "icon-lg";

  if ("href" in props && props.href !== undefined) {
    const { href, children, ...anchorProps } = props;
    const linkClassName = cn(
      buttonVariants({ variant, size, className }),
      variant === "default" || variant === "primary"
        ? "no-underline! text-sm transition-colors duration-200"
        : "no-underline! hover:text-primary/80 dark:hover:text-primary text-sm transition-colors duration-200",
      loading && "pointer-events-none cursor-wait opacity-80",
    );
    const isAppRoute = href.startsWith("/") && !href.startsWith("//");

    const linkBody =
      loading && iconOnlySize ? (
        <ButtonSpinner size={size} />
      ) : loading ? (
        <>
          <ButtonSpinner size={size} />
          {children}
        </>
      ) : (
        children
      );

    if (loading) {
      return (
        <span
          data-slot="button"
          data-variant={variant}
          data-size={size}
          data-loading
          aria-busy="true"
          aria-live="polite"
          className={linkClassName}
        >
          {linkBody}
        </span>
      );
    }

    if (isAppRoute) {
      return (
        <Link
          {...(anchorProps as Omit<
            React.ComponentProps<typeof Link>,
            "href" | "prefetch" | "className" | "children"
          >)}
          data-slot="button"
          data-variant={variant}
          data-size={size}
          href={href}
          prefetch
          className={linkClassName}
        >
          {children}
        </Link>
      );
    }

    return (
      <a
        data-slot="button"
        data-variant={variant}
        data-size={size}
        href={href}
        className={linkClassName}
        {...anchorProps}
      >
        {children}
      </a>
    );
  }

  const { children, disabled, ...buttonProps } = props as ButtonAsButtonProps;

  const effectiveAsChild = Boolean(asChild && !loading);
  const Comp = effectiveAsChild ? Slot.Root : "button";

  const body =
    loading && iconOnlySize ? (
      <ButtonSpinner size={size} />
    ) : loading ? (
      <>
        <ButtonSpinner size={size} />
        {children}
      </>
    ) : (
      children
    );

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      {...(loading ? { "data-loading": "" as const } : {})}
      disabled={effectiveAsChild ? disabled : Boolean(disabled) || loading}
      aria-busy={loading || undefined}
      className={cn(
        buttonVariants({ variant, size, className }),
        loading && "cursor-wait",
      )}
      {...(buttonProps as Omit<
        ButtonAsButtonProps,
        "className" | "variant" | "size" | "children" | "disabled" | "loading"
      >)}
    >
      {body}
    </Comp>
  );
}

export { Button, buttonVariants, type ButtonProps };
