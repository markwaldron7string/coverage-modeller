/** Formats a whole-dollar amount as US currency, e.g. 1500 -> "$1,500". */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a break-even result. Finite values render as a year count; Infinity
 * (the pricier policy never pays for itself) renders as a plain-language note.
 */
export function formatBreakEven(years: number): string {
  if (!Number.isFinite(years)) {
    return "Never breaks even";
  }
  return `${years} ${years === 1 ? "year" : "years"}`;
}