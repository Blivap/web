import { HeartHandshake, Lock } from "lucide-react";
import { formatKoboAsNaira } from "@/lib/wallet/formatWalletMoney";
import { Skeleton } from "@/components/ui/skeleton.component";

type WalletBalanceHeroProps = {
  availableKobo: number;
  heldKobo: number;
  currency: string;
  loading?: boolean;
};

export function WalletBalanceHero({
  availableKobo,
  heldKobo,
  currency,
  loading = false,
}: WalletBalanceHeroProps) {
  return (
    <div className="overflow-hidden rounded-2xl bg-linear-to-br from-primary via-[#7a0014] to-[#5c0010] px-5 py-6 text-white shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/85">
            Wallet balance
          </p>
          <p className="mt-1 text-lg font-bold leading-tight">
            Available to use
          </p>
        </div>
        <HeartHandshake
          className="h-9 w-9 shrink-0 text-white/90"
          strokeWidth={1.5}
          aria-hidden
        />
      </div>

      {loading ? (
        <div className="mt-5 flex flex-col gap-3">
          <Skeleton className="h-9 w-40 bg-white/20" />
          <Skeleton className="h-4 w-56 bg-white/15" />
        </div>
      ) : (
        <>
          <p className="mt-5 font-helvetica text-3xl font-bold tracking-tight tabular-nums">
            {formatKoboAsNaira(availableKobo, { currency })}
          </p>
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2.5">
            <Lock className="size-4 shrink-0 text-white/90" aria-hidden />
            <p className="text-xs leading-relaxed text-white/90">
              <span className="font-semibold text-white">Held: </span>
              {formatKoboAsNaira(heldKobo, { currency })} reserved for active
              donation welfare
            </p>
          </div>
        </>
      )}

      <p className="mt-3 text-xs leading-relaxed text-white/90">
        Funds support donation logistics and donor welfare under Nigerian
        voluntary donation principles — not payment for blood.
      </p>
    </div>
  );
}
