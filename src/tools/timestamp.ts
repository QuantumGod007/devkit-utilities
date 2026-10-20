import type { Tool } from "../types.ts";

export function fromUnix(value: string, multiplier: 1 | 1000 = 1000) {
  const input = value.trim();
  const valid =
    multiplier === 1000
      ? /^-?\d+(?:\.\d{1,3})?$/.test(input)
      : /^-?\d+$/.test(input);
  if (!valid)
    throw new Error(
      multiplier === 1000
        ? "Enter Unix seconds with up to three decimal places."
        : "Enter whole-number Unix milliseconds.",
    );
  const negative = input.startsWith("-");
  const [wholeText, fraction = ""] = input.replace(/^-/, "").split(".");
  const whole = wholeText.replace(/^0+(?=\d)/, "");
  if (whole.length > 16)
    throw new Error("Timestamp is outside the supported date range.");
  const milliseconds =
    (multiplier === 1000
      ? BigInt(whole) * 1000n + BigInt(fraction.padEnd(3, "0"))
      : BigInt(whole)) * (negative ? -1n : 1n);
  if (milliseconds < -8640000000000000n || milliseconds > 8640000000000000n)
    throw new Error("Timestamp is outside the supported date range.");
  return new Date(Number(milliseconds)).toISOString();
}

function isoMilliseconds(value: string) {
  const input = value.trim();
  const parts =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-](\d{2}):(\d{2}))$/.exec(
      input,
    );
  if (!parts)
    throw new Error(
      "Enter an ISO date with timezone, such as 2024-01-01T00:00:00Z.",
    );
  const [
    ,
    yearText,
    monthText,
    dayText,
    hourText,
    minuteText,
    secondText,
    ,
    ,
    zoneHour,
    zoneMinute,
  ] = parts;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [
    31,
    leapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  // Date.parse silently normalizes dates such as February 30, so check the
  // original calendar components before allowing the platform to parse them.
  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > daysInMonth[month - 1] ||
    Number(hourText) > 23 ||
    Number(minuteText) > 59 ||
    Number(secondText || 0) > 59 ||
    Number(zoneHour || 0) > 23 ||
    Number(zoneMinute || 0) > 59
  )
    throw new Error("Enter a valid calendar date and time.");
  const date = Date.parse(input);
  if (!Number.isFinite(date)) throw new Error("Enter a valid ISO date.");
  return date;
}

export function toUnix(value: string) {
  return String(Math.floor(isoMilliseconds(value) / 1000));
}
export function toMilliseconds(value: string) {
  return String(isoMilliseconds(value));
}

export const timestampTool: Tool = {
  id: "timestamp",
  name: "Unix timestamp",
  category: "Date & time",
  description:
    "Convert Unix seconds or milliseconds to UTC, or an ISO date with an explicit timezone to Unix seconds.",
  inputLabel: "Unix timestamp or ISO date",
  sample: "1700000000",
  actions: [
    { label: "Seconds → UTC", run: fromUnix },
    { label: "Milliseconds → UTC", run: (value) => fromUnix(value, 1) },
    { label: "ISO date → Unix", run: toUnix },
    { label: "ISO date → milliseconds", run: toMilliseconds },
  ],
};
