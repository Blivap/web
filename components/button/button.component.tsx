import { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import classNames from "classnames";

type ButtonVariant = "outline" | "primary" | "secondary" | "ghost" | "link";

type ButtonProps = {
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
} & DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

const baseClasses =
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-[#14141a] py-4";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white enabled:hover:bg-primary/90",
  outline:
    "border border-primary text-primary bg-transparent enabled:hover:bg-primary/5",
  secondary:
    "border border-[#E5E7EB] bg-[#F4F4F5] text-[#111827] enabled:hover:bg-[#E4E4E7] dark:border-white/10 dark:bg-white/10 dark:text-white/90 dark:enabled:hover:bg-white/14",
  ghost: "bg-transparent text-primary enabled:hover:bg-primary/5",
  link: "bg-transparent text-primary underline-offset-4 enabled:hover:underline p-0 h-auto",
};

export const Button = (props: ButtonProps) => {
  const {
    children,
    className,
    variant = "primary",
    loading,
    disabled,
    ...rest
  } = props;

  const isDisabled = disabled || loading;

  return (
    <button
      {...rest}
      disabled={isDisabled}
      className={classNames(
        baseClasses,
        variantClasses[variant],
        loading && "cursor-wait opacity-80",
        className,
      )}
    >
      {children}
    </button>
  );
};
