import {
  BREAKS,
  BREAK_GREETING,
  DATED_DAYS,
  EASTER_GREETING,
  FESTIVE_SEASON,
  FIXED_DAYS,
} from "../data/holidays";

const pad = (n: number) => String(n).padStart(2, "0");
const toIso = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const monthDay = (month: number, day: number) => month * 100 + day;
const isLeapYear = (y: number) =>
  (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

// Easter Sunday for a given year (Gregorian calendar)
export function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

// Accepts "MM-DD" or "YYYY-MM-DD". Only the day and month are used.
function parseBirthday(value: string): { month: number; day: number } | null {
  const parts = value.split("-").map(Number);
  const [month, day] = parts.length === 3 ? [parts[1], parts[2]] : parts;
  if (!Number.isInteger(month) || !Number.isInteger(day)) return null;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { month, day };
}

export function isBirthday(now: Date, birthday?: string): boolean {
  if (!birthday) return false;
  const parsed = parseBirthday(birthday);
  if (!parsed) return false;
  // Born on 29 February: celebrate on the 28th in years without one
  const day =
    parsed.month === 2 && parsed.day === 29 && !isLeapYear(now.getFullYear())
      ? 28
      : parsed.day;
  return now.getMonth() + 1 === parsed.month && now.getDate() === day;
}

function specialDayGreeting(now: Date): string | null {
  const month = now.getMonth() + 1;
  const day = now.getDate();

  const fixed = FIXED_DAYS.find((d) => d.month === month && d.day === day);
  if (fixed) return fixed.greeting;

  const iso = toIso(now);
  const dated = DATED_DAYS.find((d) => d.date === iso);
  if (dated) return dated.greeting;

  const easter = easterSunday(now.getFullYear());
  const easterMonday = new Date(
    easter.getFullYear(),
    easter.getMonth(),
    easter.getDate() + 1,
  );
  if (iso === toIso(easter) || iso === toIso(easterMonday))
    return EASTER_GREETING;

  return null;
}

function isHolidayPeriod(now: Date): boolean {
  const iso = toIso(now);
  if (BREAKS.some((b) => iso >= b.start && iso <= b.end)) return true;

  const today = monthDay(now.getMonth() + 1, now.getDate());
  const start = monthDay(FESTIVE_SEASON.start.month, FESTIVE_SEASON.start.day);
  const end = monthDay(FESTIVE_SEASON.end.month, FESTIVE_SEASON.end.day);
  // The festive season crosses the new year, so it wraps around
  return start <= end
    ? today >= start && today <= end
    : today >= start || today <= end;
}

function timeGreeting(hour: number): string {
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17) return "Good evening";
  return "Hello"; // midnight to 4:59am
}

interface GreetingOptions {
  now?: Date;
  birthday?: string; // "MM-DD" or "YYYY-MM-DD"
  justSignedIn?: boolean;
}

// Order of priority: birthday, special day, school break or festive season,
// "Welcome back" right after signing in, then the time of day.
export function getGreeting({
  now = new Date(),
  birthday,
  justSignedIn = false,
}: GreetingOptions = {}): string {
  if (isBirthday(now, birthday)) return "Happy birthday";
  const special = specialDayGreeting(now);
  if (special) return special;
  if (isHolidayPeriod(now)) return BREAK_GREETING;
  if (justSignedIn) return "Welcome back";
  return timeGreeting(now.getHours());
}
