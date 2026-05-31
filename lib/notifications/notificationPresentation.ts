import {
  Bell,
  CalendarCheck,
  CalendarX,
  CheckCheck,
  Droplet,
  ShieldCheck,
  ShieldX,
  type LucideIcon,
} from "lucide-react";

type NotificationPresentation = {
  label: string;
  Icon: LucideIcon;
  iconClassName: string;
  unreadAccentClassName: string;
};

const DEFAULT_PRESENTATION: NotificationPresentation = {
  label: "Update",
  Icon: Bell,
  iconClassName: "text-primary bg-[#F9E8EE] dark:bg-primary/20",
  unreadAccentClassName: "border-primary",
};

const BY_TYPE: Record<string, NotificationPresentation> = {
  donor_approved: {
    label: "Donor approved",
    Icon: CheckCheck,
    iconClassName:
      "text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/40",
    unreadAccentClassName: "border-emerald-500",
  },
  donor_matched: {
    label: "Donor match",
    Icon: Droplet,
    iconClassName: "text-primary bg-[#F9E8EE] dark:bg-primary/20",
    unreadAccentClassName: "border-primary",
  },
  booking_request_sent: {
    label: "Booking request",
    Icon: CalendarCheck,
    iconClassName: "text-primary bg-[#F9E8EE] dark:bg-primary/20",
    unreadAccentClassName: "border-primary",
  },
  booking_accepted: {
    label: "Booking accepted",
    Icon: CalendarCheck,
    iconClassName:
      "text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/40",
    unreadAccentClassName: "border-emerald-500",
  },
  booking_rejected: {
    label: "Booking declined",
    Icon: CalendarX,
    iconClassName:
      "text-amber-800 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/35",
    unreadAccentClassName: "border-amber-500",
  },
  verification_approved: {
    label: "Verification approved",
    Icon: ShieldCheck,
    iconClassName:
      "text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/40",
    unreadAccentClassName: "border-emerald-500",
  },
  verification_rejected: {
    label: "Verification update",
    Icon: ShieldX,
    iconClassName:
      "text-amber-800 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/35",
    unreadAccentClassName: "border-amber-500",
  },
};

export function notificationPresentation(type: string): NotificationPresentation {
  return BY_TYPE[type] ?? DEFAULT_PRESENTATION;
}
