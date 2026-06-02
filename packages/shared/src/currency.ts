/**
 * Currency utilities for Kenyan Shillings (KES).
 *
 * The backend stores all monetary values as DECIMAL strings (e.g. "50000.00").
 * Use `parseMoney` to convert those to numbers for arithmetic, and `formatKES`
 * to convert back to display strings.  Never do raw `parseFloat` on amounts
 * you intend to add together — floating-point drift accumulates.
 */

export const CURRENCY_CODE = "KES" as const;

/** Locale used for number grouping inside Kenya. */
const KE_LOCALE = "en-KE";

/**
 * Format a numeric or decimal-string amount as a KES display string.
 *
 * @example
 * formatKES(50000)          // "KES 50,000"
 * formatKES("1500.75", { decimals: true }) // "KES 1,500.75"
 * formatKES(1_250_000, { compact: true })  // "KES 1.3M"
 */
export function formatKES(
  amount: string | number,
  options: {
    /** Show two decimal places. Default false (whole shillings). */
    decimals?: boolean;
    /** Abbreviate large numbers: 1.3M, 250K. Default false. */
    compact?: boolean;
  } = {}
): string {
  const { decimals = false, compact = false } = options;
  const num = typeof amount === "string" ? parseFloat(amount) : amount;

  if (Number.isNaN(num)) return `${CURRENCY_CODE} 0`;

  if (compact) {
    if (Math.abs(num) >= 1_000_000) {
      return `${CURRENCY_CODE} ${(num / 1_000_000).toFixed(1)}M`;
    }
    if (Math.abs(num) >= 1_000) {
      return `${CURRENCY_CODE} ${(num / 1_000).toFixed(1)}K`;
    }
  }

  return `${CURRENCY_CODE} ${num.toLocaleString(KE_LOCALE, {
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
  })}`;
}

/**
 * Parse a backend decimal string ("50000.00") to a JS number.
 * Returns 0 for null / undefined / non-numeric values instead of NaN.
 */
export function parseMoney(value: string | null | undefined): number {
  if (value == null || value === "") return 0;
  const num = parseFloat(value);
  return Number.isNaN(num) ? 0 : num;
}

/**
 * Sum an array of backend decimal strings without floating-point drift.
 * Returns the result as a two-decimal string matching the backend format.
 *
 * @example
 * sumMoney(["1000.00", "500.50", "250.25"]) // "1750.75"
 */
export function sumMoney(amounts: string[]): string {
  const total = amounts.reduce((acc, a) => acc + parseMoney(a), 0);
  return total.toFixed(2);
}

/**
 * Subtract b from a, both as backend decimal strings.
 * Returns a two-decimal string.
 */
export function subtractMoney(a: string, b: string): string {
  return (parseMoney(a) - parseMoney(b)).toFixed(2);
}

/**
 * Return true when the amount is greater than zero.
 * Useful for conditionally rendering payment CTAs.
 */
export function isPositive(amount: string | number): boolean {
  return parseMoney(String(amount)) > 0;
}
