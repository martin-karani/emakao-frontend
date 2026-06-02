/**
 * Kenyan phone number utilities.
 *
 * Kenya uses the +254 country code.  M-Pesa (Safaricom) accepts numbers in the
 * "2547XXXXXXXX" format (no leading plus).  Staff-facing UIs typically show
 * the local "07XX XXX XXX" display format.
 *
 * Supported input formats:
 *   "0712345678"       local with leading zero
 *   "+254712345678"    E.164 with plus
 *   "254712345678"     E.164 without plus
 *   "712345678"        local without leading zero (treated as 07xx)
 */

const KENYA_CODE = "254";
const KENYA_PREFIX = "+254";

/** Strip all whitespace and non-digit/plus characters. */
function sanitize(phone: string): string {
  return phone.replace(/[\s\-().]/g, "").trim();
}

/**
 * Normalize any valid Kenyan phone number to E.164 format: "+254712345678".
 * Returns null for unrecognisable inputs rather than throwing.
 *
 * @example
 * normalizePhone("0712345678")    // "+254712345678"
 * normalizePhone("254712345678")  // "+254712345678"
 * normalizePhone("+254712345678") // "+254712345678"
 */
export function normalizePhone(phone: string): string | null {
  const s = sanitize(phone);

  if (s.startsWith(KENYA_PREFIX)) {
    // "+254XXXXXXXXX" — already E.164
    return isValidE164(s) ? s : null;
  }

  if (s.startsWith(KENYA_CODE) && !s.startsWith("+")) {
    // "254XXXXXXXXX"
    const candidate = `+${s}`;
    return isValidE164(candidate) ? candidate : null;
  }

  if (s.startsWith("0") && s.length === 10) {
    // "0XXXXXXXXX" — local format
    return `+${KENYA_CODE}${s.slice(1)}`;
  }

  if (/^\d{9}$/.test(s)) {
    // "7XXXXXXXX" — 9 digits without prefix
    return `+${KENYA_CODE}${s}`;
  }

  return null;
}

/**
 * Convert any valid Kenyan phone to M-Pesa STK push format: "254712345678".
 * Safaricom rejects the leading "+" in their callback API.
 *
 * Returns null for invalid inputs.
 */
export function toMpesaPhone(phone: string): string | null {
  const e164 = normalizePhone(phone);
  return e164 ? e164.slice(1) : null; // strip leading "+"
}

/**
 * Format a phone number for human display: "0712 345 678".
 * Falls back to the raw input if the number cannot be parsed.
 */
export function formatPhoneDisplay(phone: string): string {
  const e164 = normalizePhone(phone);
  if (!e164) return phone;

  // "+254712345678" → "0712 345 678"
  const local = `0${e164.slice(KENYA_PREFIX.length)}`;
  return local.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3");
}

/**
 * Return true when the string is a recognisable Kenyan phone number.
 */
export function isValidKenyanPhone(phone: string): boolean {
  return normalizePhone(phone) !== null;
}

/** Internal: validate a +254XXXXXXXXX string (9 subscriber digits). */
function isValidE164(phone: string): boolean {
  return /^\+254\d{9}$/.test(phone);
}
