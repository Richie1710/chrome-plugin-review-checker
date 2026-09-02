import { t, DEFAULT_LOCALE } from "./i18n.js";

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function unitLabel(locale, unit, count) {
  return t(locale, `time.unit.${unit}.${count === 1 ? "one" : "other"}`);
}

export function relativeTime(isoString, now = new Date(), locale = DEFAULT_LOCALE) {
  const then = new Date(isoString);
  const diffMs = now.getTime() - then.getTime();

  if (diffMs < MINUTE) {
    return t(locale, "time.justNow");
  }
  if (diffMs < HOUR) {
    const minutes = Math.floor(diffMs / MINUTE);
    return t(locale, "time.ago", { count: minutes, unit: unitLabel(locale, "minute", minutes) });
  }
  if (diffMs < DAY) {
    const hours = Math.floor(diffMs / HOUR);
    return t(locale, "time.ago", { count: hours, unit: unitLabel(locale, "hour", hours) });
  }
  const days = Math.floor(diffMs / DAY);
  return t(locale, "time.ago", { count: days, unit: unitLabel(locale, "day", days) });
}
