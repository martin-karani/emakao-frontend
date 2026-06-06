const shortDateFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const longDateFormatter = new Intl.DateTimeFormat("en-KE", {
  timeZone: "UTC",
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

const monthYearFormatter = new Intl.DateTimeFormat("en-KE", {
  timeZone: "UTC",
  month: "long",
  year: "numeric",
});

function toValidDate(value: string | number | Date | null | undefined) {
  if (value == null || value === "") {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatShortDate(
  value: string | number | Date | null | undefined,
) {
  const date = toValidDate(value);
  return date ? shortDateFormatter.format(date) : "—";
}

export function formatLongDate(
  value: string | number | Date | null | undefined,
) {
  const date = toValidDate(value);
  return date ? longDateFormatter.format(date) : "—";
}

export function formatMonthYear(
  value: string | number | Date | null | undefined,
) {
  const date = toValidDate(value);
  return date ? monthYearFormatter.format(date) : "—";
}
