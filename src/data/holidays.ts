// Special days for the greeting on the home screen.
// Edit this file when the dates change. Nothing else needs to be touched.

export interface FixedDay {
  month: number; // 1 to 12
  day: number;
  greeting: string;
}

// Same date every year (Nigerian public holidays and Christmas)
export const FIXED_DAYS: FixedDay[] = [
  { month: 1, day: 1, greeting: "Happy New Year" },
  { month: 5, day: 1, greeting: "Happy Workers' Day" },
  { month: 6, day: 12, greeting: "Happy Democracy Day" },
  { month: 10, day: 1, greeting: "Happy Independence Day" },
  { month: 12, day: 25, greeting: "Merry Christmas" },
];

// Easter Sunday and Easter Monday are worked out automatically for every year
export const EASTER_GREETING = "Happy Easter";

// Days that move every year and depend on an announcement (Eid and similar).
// Add them once the date is confirmed, as "YYYY-MM-DD".
export interface DatedDay {
  date: string;
  greeting: string;
}
export const DATED_DAYS: DatedDay[] = [
  // { date: "YYYY-MM-DD", greeting: "Eid Mubarak" },
];

// School breaks, from the university calendar. Add each break as "YYYY-MM-DD".
export interface Break {
  start: string;
  end: string;
}
export const BREAKS: Break[] = [
  // { start: "YYYY-MM-DD", end: "YYYY-MM-DD" },
];

export const BREAK_GREETING = "Happy holidays";

// Festive season, every year. Shown on any day that has no greeting of its own.
export const FESTIVE_SEASON = {
  start: { month: 12, day: 20 },
  end: { month: 1, day: 4 },
};
