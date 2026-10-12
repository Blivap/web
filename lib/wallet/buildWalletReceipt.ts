import {
  formatKoboAsNaira,
  formatWalletEntryWhen,
} from "@/lib/wallet/formatWalletMoney";
import { walletEntryCopy } from "@/lib/wallet/walletEntryPresentation";
import type { WalletLedgerEntry } from "@/types/wallet";

export type WalletReceipt = {
  id: string;
  title: string;
  description: string;
  direction: "credit" | "debit";
  directionLabel: string;
  amountLabel: string;
  signedAmountLabel: string;
  currency: string;
  whenLabel: string;
  bookingId: string | null;
  bookingLabel: string | null;
  typeLabel: string;
  accountLabel: string;
  referenceHint: string;
  plainText: string;
  fileBaseName: string;
};

function receiptId(entry: WalletLedgerEntry, index: number): string {
  const when = entry.createdAt?.replace(/[:.]/g, "-") ?? "undated";
  const booking = entry.bookingId?.slice(0, 8) ?? "nobooking";
  return `${entry.type}-${when}-${booking}-${entry.amountKobo}-${index}`;
}

function fileSafe(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export function buildWalletReceipt(
  entry: WalletLedgerEntry,
  options: {
    currency: string;
    accountLabel?: string;
    index?: number;
  },
): WalletReceipt {
  const copy = walletEntryCopy(entry.type, entry.label);
  const isCredit = entry.direction === "credit";
  const amountLabel = formatKoboAsNaira(entry.amountKobo, {
    currency: options.currency,
  });
  const signedAmountLabel = `${isCredit ? "+" : "−"}${amountLabel}`;
  const whenLabel = formatWalletEntryWhen(entry.createdAt);
  const bookingLabel = entry.bookingId
    ? `Booking ${entry.bookingId}`
    : null;
  const accountLabel = options.accountLabel?.trim() || "Blivap account";
  const id = receiptId(entry, options.index ?? 0);
  const referenceHint = entry.bookingId
    ? entry.bookingId
    : `${entry.type}-${entry.createdAt ?? "na"}-${entry.amountKobo}`;

  const plainText = [
    "Blivap Wallet Receipt",
    "---------------------",
    `Title: ${copy.title}`,
    `Type: ${entry.type}`,
    `Direction: ${isCredit ? "Credit" : "Debit"}`,
    `Amount: ${signedAmountLabel}`,
    `Currency: ${options.currency}`,
    `Date: ${whenLabel}`,
    bookingLabel ? `${bookingLabel}` : null,
    `Account: ${accountLabel}`,
    `Reference: ${referenceHint}`,
    "",
    copy.description,
    "",
    "This receipt summarises a wallet ledger entry on Blivap.",
    "Funds support donation logistics and donor welfare under Nigerian voluntary donation principles.",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    id,
    title: copy.title,
    description: copy.description,
    direction: entry.direction,
    directionLabel: isCredit ? "Credit" : "Debit",
    amountLabel,
    signedAmountLabel,
    currency: options.currency,
    whenLabel,
    bookingId: entry.bookingId,
    bookingLabel,
    typeLabel: entry.type,
    accountLabel,
    referenceHint,
    plainText,
    fileBaseName: `blivap-wallet-${fileSafe(copy.title)}-${fileSafe(whenLabel) || "receipt"}`,
  };
}

export function buildWalletReceiptHtml(receipt: WalletReceipt): string {
  const escaped = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escaped(receipt.title)} · Blivap Receipt</title>
  <style>
    body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif; background: #f4f4f5; color: #111827; }
    .sheet { max-width: 420px; margin: 24px auto; background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 28px 24px; box-shadow: 0 8px 24px rgba(15,23,42,.06); }
    .brand { color: #960018; font-weight: 700; letter-spacing: .04em; font-size: 12px; text-transform: uppercase; }
    h1 { margin: 8px 0 4px; font-size: 22px; }
    .muted { color: #6b7280; font-size: 13px; line-height: 1.5; }
    .amount { margin: 20px 0 8px; font-size: 32px; font-weight: 700; letter-spacing: -0.02em; color: ${receipt.direction === "credit" ? "#166534" : "#960018"}; }
    .badge { display: inline-block; margin-top: 4px; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; background: ${receipt.direction === "credit" ? "#dcfce8" : "#fff5f5"}; color: ${receipt.direction === "credit" ? "#166534" : "#960018"}; }
    .rows { margin-top: 22px; border-top: 1px dashed #e5e7eb; padding-top: 16px; }
    .row { display: flex; justify-content: space-between; gap: 12px; padding: 8px 0; font-size: 13px; border-bottom: 1px solid #f3f4f6; }
    .row span:first-child { color: #6b7280; }
    .row span:last-child { font-weight: 600; text-align: right; word-break: break-all; }
    .foot { margin-top: 18px; font-size: 11px; color: #9ca3af; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="brand">Blivap Wallet</div>
    <h1>${escaped(receipt.title)}</h1>
    <p class="muted">${escaped(receipt.description)}</p>
    <div class="amount">${escaped(receipt.signedAmountLabel)}</div>
    <div class="badge">${escaped(receipt.directionLabel)}</div>
    <div class="rows">
      <div class="row"><span>Date</span><span>${escaped(receipt.whenLabel)}</span></div>
      <div class="row"><span>Type</span><span>${escaped(receipt.typeLabel)}</span></div>
      <div class="row"><span>Currency</span><span>${escaped(receipt.currency)}</span></div>
      <div class="row"><span>Account</span><span>${escaped(receipt.accountLabel)}</span></div>
      ${
        receipt.bookingLabel
          ? `<div class="row"><span>Booking</span><span>${escaped(receipt.bookingLabel)}</span></div>`
          : ""
      }
      <div class="row"><span>Reference</span><span>${escaped(receipt.referenceHint)}</span></div>
    </div>
    <p class="foot">Generated from your Blivap wallet activity. Support credits follow Nigerian voluntary donation principles.</p>
  </div>
</body>
</html>`;
}
