/** Nigerian naira formatting shared by every price surface in the app. */
export function formatNaira(amount: number): string {
  return `₦${new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }).format(amount)}`;
}

/** Compact form for tight spaces, e.g. "₦350k". Falls back to full form below ₦1,000. */
export function formatNairaCompact(amount: number): string {
  if (amount >= 1_000 && amount % 1_000 === 0) {
    return `₦${new Intl.NumberFormat("en-NG").format(amount / 1_000)}k`;
  }
  return formatNaira(amount);
}
