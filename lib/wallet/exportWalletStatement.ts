import {
  formatKoboAsNaira,
  formatWalletEntryWhen,
} from "@/lib/wallet/formatWalletMoney";
import { walletEntryCopy } from "@/lib/wallet/walletEntryPresentation";
import type { WalletLedgerEntry } from "@/types/wallet";

/** Client-side CSV for “Export statement”. */
export function downloadWalletStatementCsv(
  entries: WalletLedgerEntry[],
  currency: string,
): void {
  const header = [
    "Title",
    "Description",
    "Direction",
    "Amount",
    "Currency",
    "Status",
    "Booking ID",
    "Date",
  ];

  const rows = [...entries]
    .sort((a, b) => {
      const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
      const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
      return (
        (Number.isFinite(bTime) ? bTime : 0) -
        (Number.isFinite(aTime) ? aTime : 0)
      );
    })
    .map((entry) => {
      const copy = walletEntryCopy(entry.type, entry.label);
      const signed = `${entry.direction === "credit" ? "+" : "-"}${formatKoboAsNaira(entry.amountKobo, { currency })}`;
      return [
        csvCell(copy.title),
        csvCell(copy.description),
        csvCell(entry.direction),
        csvCell(signed),
        csvCell(currency),
        csvCell("Completed"),
        csvCell(entry.bookingId ?? ""),
        csvCell(formatWalletEntryWhen(entry.createdAt)),
      ].join(",");
    });

  const csv = [header.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  anchor.href = url;
  anchor.download = `blivap-wallet-statement-${stamp}.csv`;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

function csvCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
