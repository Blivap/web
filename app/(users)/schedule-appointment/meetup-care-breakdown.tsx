import {
  Baby,
  BedDouble,
  Briefcase,
  Car,
  CupSoda,
  Heart,
  Smartphone,
  UserRound,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { InfoHint } from "@/components/ui/info-hint/info-hint.component";
import type { MeetupCareQuoteLine } from "@/lib/donors/donorWelfarePreferences";
import { formatWalletAmount } from "@/lib/wallet/formatWalletDisplay";

type CarePayer = "you" | "donor";

export type CareLine = {
  id: string;
  title: string;
  detail: string;
  payer: CarePayer;
  amountKobo: number;
  icon: LucideIcon;
};

const ICONS: Record<string, LucideIcon> = {
  transport: Car,
  feeding: UtensilsCrossed,
  refreshments: CupSoda,
  accommodation: BedDouble,
  companion: UserRound,
  childcare: Baby,
  airtime: Smartphone,
  time_away: Briefcase,
};

export function careLinesFromQuote(lines: MeetupCareQuoteLine[]): CareLine[] {
  return lines.map((line) => ({
    id: line.code,
    title: line.title,
    detail: line.detail,
    payer: line.payer,
    amountKobo: line.amountKobo,
    icon: ICONS[line.code] ?? Heart,
  }));
}

export function MeetupCareBreakdown({
  lines,
  loading = false,
  error = null,
  onRetry,
}: {
  lines: CareLine[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}) {
  const yours = lines.filter((line) => line.payer === "you");
  const theirs = lines.filter((line) => line.payer === "donor");
  const dueKobo = yours.reduce((sum, line) => sum + line.amountKobo, 0);

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-white dark:border-white/10 dark:bg-[#14141a]">
      <header className="flex items-start justify-between gap-3 border-b border-border px-4 py-4 sm:px-5 dark:border-white/10">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-semibold text-text-primary">
              Care for this visit
            </h3>
            <InfoHint
              title="Care for this visit"
              label="How meetup care is split"
              className="size-7"
            >
              <p>
                Donation stays voluntary and unpaid. This sheet is only the
                practical cost of a safe visit. The donor chooses which care
                the requester arranges, and those amounts are held from the
                wallet before the request is sent.
              </p>
            </InfoHint>
          </div>
          <p className="mt-1 text-xs text-text-secondary">
            {yours.length > 0
              ? "Same-day screening. You arrange the items below."
              : "Same-day screening. This donor is covering their own care."}
          </p>
        </div>
        <p className="shrink-0 text-right text-xs font-medium text-text-primary">
          {loading ? "…" : `${yours.length} on you`}
        </p>
      </header>

      {loading ? (
        <p className="px-4 py-6 text-sm text-text-secondary sm:px-5">
          Loading care for this visit…
        </p>
      ) : error ? (
        <div className="px-4 py-6 sm:px-5">
          <p className="text-sm text-text-primary">{error}</p>
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 text-xs font-semibold text-primary hover:underline"
            >
              Try again
            </button>
          ) : null}
        </div>
      ) : lines.length === 0 ? (
        <p className="px-4 py-6 text-sm text-text-secondary sm:px-5">
          No meetup care packages are offered right now.
        </p>
      ) : (
        <>
          <ul>
            {yours.map((line) => (
              <CareRow key={line.id} line={line} />
            ))}
          </ul>
          <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 sm:px-5 dark:border-white/10">
            <p className="text-sm font-medium text-text-primary">
              Due before booking
            </p>
            <p className="text-sm font-semibold tabular-nums text-primary">
              {formatWalletAmount(dueKobo)}
            </p>
          </div>

          {theirs.length > 0 ? (
            <>
              <div className="border-t border-border bg-[#FAFAF9] px-4 py-2.5 sm:px-5 dark:border-white/10 dark:bg-white/4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                  Not charged to you
                </p>
              </div>
              <ul>
                {theirs.map((line) => (
                  <CareRow key={line.id} line={line} />
                ))}
              </ul>
            </>
          ) : null}
        </>
      )}
    </section>
  );
}

function CareRow({ line }: { line: CareLine }) {
  const Icon = line.icon;
  const yours = line.payer === "you";

  return (
    <li className="flex items-center gap-3 border-b border-[#F3F4F6] px-4 py-3 last:border-b-0 sm:px-5 dark:border-white/10">
      <Icon
        className="size-4 shrink-0 text-text-tertiary"
        strokeWidth={1.75}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text-primary">{line.title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-text-secondary">
          {line.detail}
        </p>
      </div>
      <p
        className={
          yours
            ? "shrink-0 text-xs font-semibold text-primary"
            : "shrink-0 text-xs font-medium text-text-tertiary"
        }
      >
        {yours ? formatWalletAmount(line.amountKobo) : "Donor"}
      </p>
    </li>
  );
}
