/** Matches GET /wallet/banks items: `{ bank, code }`. */
export type WalletBankOption = {
  bank: string;
  code: string;
};

export function filterWalletBanks(
  banks: readonly WalletBankOption[],
  query: string,
): WalletBankOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...banks];
  return banks.filter(
    (row) =>
      row.bank.toLowerCase().includes(q) || row.code.toLowerCase().includes(q),
  );
}
