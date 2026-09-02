const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function relativeTime(isoString, now = new Date()) {
  const then = new Date(isoString);
  const diffMs = now.getTime() - then.getTime();

  if (diffMs < MINUTE) {
    return "gerade eben";
  }
  if (diffMs < HOUR) {
    const minutes = Math.floor(diffMs / MINUTE);
    return `vor ${minutes} ${minutes === 1 ? "Minute" : "Minuten"}`;
  }
  if (diffMs < DAY) {
    const hours = Math.floor(diffMs / HOUR);
    return `vor ${hours} ${hours === 1 ? "Stunde" : "Stunden"}`;
  }
  const days = Math.floor(diffMs / DAY);
  return `vor ${days} ${days === 1 ? "Tag" : "Tagen"}`;
}
