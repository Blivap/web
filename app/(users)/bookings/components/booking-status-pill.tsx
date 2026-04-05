import classNames from "classnames";

export type BookingPillVariant =
  | "profile"
  | "accepted"
  | "pending"
  | "rejected";

type BookingStatusPillProps = {
  children: React.ReactNode;
  variant?: BookingPillVariant;
  className?: string;
};

const variantClass: Record<BookingPillVariant, string> = {
  profile: "bg-[#374151] text-white",
  accepted: "bg-emerald-600 text-white",
  pending: "bg-amber-500 text-white",
  rejected: "bg-red-600 text-white",
};

export function BookingStatusPill({
  children,
  variant = "profile",
  className,
}: BookingStatusPillProps) {
  return (
    <span
      className={classNames(
        "inline-flex max-w-full items-center justify-center rounded-full px-3 py-1 text-center text-xs font-medium whitespace-nowrap",
        variantClass[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
