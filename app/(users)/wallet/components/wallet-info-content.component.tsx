import { Award, ShieldCheck } from "lucide-react";

/** Body copy for the wallet page InfoHint dialog. */
export function WalletInfoContent() {
  return (
    <>
      <section className="flex gap-3">
        <ShieldCheck
          className="mt-0.5 size-5 shrink-0 text-primary"
          strokeWidth={1.75}
          aria-hidden
        />
        <div>
          <p className="font-semibold text-text-primary">
            Voluntary donation first
          </p>
          <p className="mt-1 text-xs leading-relaxed text-text-secondary">
            Blivap aligns with Nigerian National Blood Policy and NBTS guidance:
            donation is voluntary, unpaid, and safe. Wallet funds cover logistics
            and donor welfare stipends only.
          </p>
        </div>
      </section>

      <div className="flex items-center gap-2 rounded-lg bg-[#F8F6F4] px-3 py-2.5 dark:bg-white/6">
        <Award
          className="size-4 shrink-0 text-primary"
          strokeWidth={1.75}
          aria-hidden
        />
        <p className="text-[11px] leading-relaxed text-text-secondary">
          <span className="font-semibold text-text-primary">Compliance note:</span>{" "}
          Informational only; always follow facility staff and national health
          guidelines for screening and donation.
        </p>
      </div>

      <section>
        <p className="font-semibold text-text-primary">Held vs available</p>
        <p className="mt-1 text-xs leading-relaxed text-text-secondary">
          Available balance can pay for donor welfare on new bookings. Held
          amounts are reserved until a booking completes, refunds, or reimburses.
        </p>
      </section>

      <section>
        <p className="font-semibold text-text-primary">Top-up fees</p>
        <p className="mt-1 text-xs leading-relaxed text-text-secondary">
          The amount charged is credited to your wallet. Processing fee and VAT
          shown at checkout are estimates based on Paystack local rates and may
          be settled with the merchant after payment.
        </p>
      </section>
    </>
  );
}
