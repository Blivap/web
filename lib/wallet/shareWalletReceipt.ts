import {
  buildWalletReceiptHtml,
  type WalletReceipt,
} from "@/lib/wallet/buildWalletReceipt";

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export async function downloadWalletReceipt(
  receipt: WalletReceipt,
): Promise<"html" | "text"> {
  try {
    const html = buildWalletReceiptHtml(receipt);
    triggerDownload(
      new Blob([html], { type: "text/html;charset=utf-8" }),
      `${receipt.fileBaseName}.html`,
    );
    return "html";
  } catch {
    triggerDownload(
      new Blob([receipt.plainText], { type: "text/plain;charset=utf-8" }),
      `${receipt.fileBaseName}.txt`,
    );
    return "text";
  }
}

export type ShareWalletReceiptResult =
  | "shared"
  | "copied"
  | "unsupported"
  | "cancelled";

export async function shareWalletReceipt(
  receipt: WalletReceipt,
): Promise<ShareWalletReceiptResult> {
  const shareData: ShareData = {
    title: `${receipt.title} · Blivap`,
    text: receipt.plainText,
  };

  try {
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function" &&
      (!navigator.canShare || navigator.canShare(shareData))
    ) {
      await navigator.share(shareData);
      return "shared";
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return "cancelled";
    }
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(receipt.plainText);
      return "copied";
    }
  } catch {
    // fall through
  }

  return "unsupported";
}
