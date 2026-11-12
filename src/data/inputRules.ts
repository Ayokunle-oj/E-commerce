// The rules every text input follows, in one place.
// These help honest users and add a second layer of defence. They are NOT the real protection:
// anything checked in the browser can be skipped by an attacker, so the same limits must also be
// enforced by the database and the server (Supabase RLS and column checks) once they exist.
//
// Text is stored as plain text and escaped when it is shown (React does this for us),
// instead of trying to strip HTML out of it. Never use dangerouslySetInnerHTML.

export const LIMITS = {
  search: 100,
  promo: 20,
  reviewText: 1000,
  displayName: 60,
} as const;

// Invisible characters that can hide text or flip its direction
const INVISIBLE = /[\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u2069\uFEFF]/g;
// Control characters, except tab, line feed and carriage return
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g;

// Cut by whole characters, so an emoji is never split in half
const truncate = (value: string, max: number) =>
  Array.from(value).slice(0, Math.max(0, max)).join("");

const base = (value: string) =>
  String(value ?? "").normalize("NFC").replace(INVISIBLE, "").replace(CONTROL, "");

// One line: search box, names, codes
export function cleanSingleLine(value: string, max: number): string {
  return truncate(base(value).replace(/\s+/g, " ").trim(), max);
}

// Several lines: review text. Keeps line breaks, but no more than one blank line in a row.
export function cleanMultiline(value: string, max: number): string {
  const text = base(value)
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return truncate(text, max);
}

// Promo codes: capital letters, digits, dash and underscore only
export function toPromoCode(value: string): string {
  // Remove what is not allowed first, then cap the length, so odd characters never use up the space
  const allowed = cleanSingleLine(value, 200)
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "");
  return truncate(allowed, LIMITS.promo);
}

// A link or image address is only used if it is a normal web address or a path on this site.
// This blocks javascript:, data: and similar tricks, and protocol-relative //host links.
export function isSafeUrl(value: string): boolean {
  const text = String(value ?? "").trim();
  if (!text) return false;
  if (text.startsWith("/")) return !text.startsWith("//") && !text.startsWith("/\\");
  try {
    const url = new URL(text);
    return (url.protocol === "https:" || url.protocol === "http:") && !url.username && !url.password;
  } catch {
    return false;
  }
}
