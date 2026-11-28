export const PASSWORD_MIN = 12;
export const PASSWORD_MAX = 128;

const count = (s: string) => Array.from(s).length;

export const normalizeEmail = (raw: string) => raw.trim().toLowerCase();

export function checkEmail(raw: string): string | null {
  const v = raw.trim();
  if (!v) return "Enter your email address.";
  if (v.length > 254 || !/^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[A-Za-z]{2,}$/.test(v)) {
    return "Enter a valid email address, like name@example.com.";
  }
  return null;
}

export function checkName(raw: string): string | null {
  const v = raw.normalize("NFC").replace(/\s+/g, " ").trim();
  if (!v) return "Enter your full name.";
  if (!/^[\p{L}\p{M} '’.-]+$/u.test(v) || !/\p{L}/u.test(v)) {
    return "Use letters, spaces, hyphens, apostrophes and full stops only.";
  }
  if (count(v) < 2) return "Your name needs at least 2 characters.";
  if (count(v) > 60) return "Your name can be at most 60 characters.";
  return null;
}

export function checkPhone(raw: string): string | null {
  const v = raw.trim();
  if (!v) return null; // optional
  return /^\+?[\d\s().-]{7,20}$/.test(v) ? null : "Enter a valid phone number, like 0803 123 4567.";
}

// Passwords are never trimmed or altered. Spaces, symbols and Unicode are all allowed.
export function checkPassword(pw: string, email = "", name = ""): string | null {
  if (!pw) return "Enter your password.";
  if (/[\u0000-\u001F\u007F]/.test(pw)) return "That password contains characters we can't accept.";
  if (count(pw) < PASSWORD_MIN) return `Use at least ${PASSWORD_MIN} characters.`;
  if (count(pw) > PASSWORD_MAX) return `Use no more than ${PASSWORD_MAX} characters.`;
  const low = pw.toLowerCase();
  const same = [email.trim().toLowerCase(), email.split("@")[0]?.toLowerCase(), name.trim().toLowerCase()];
  if (same.some((x) => x && x === low)) return "Your password is too similar to your name or email.";
  return null;
}

// Advice only. Your server must make the real decision.
export function passwordStrength(pw: string): { level: 0 | 1 | 2 | 3 | 4; label: string } {
  if (!pw) return { level: 0, label: "" };
  const n = count(pw);
  if (n < PASSWORD_MIN) return { level: 1, label: "Too short" };
  const classes = [/\p{Ll}/u, /\p{Lu}/u, /\p{N}/u, /[^\p{L}\p{N}]/u].filter((r) => r.test(pw)).length;
  let score = 1 + (n >= 16 ? 1 : 0) + (n >= 20 ? 1 : 0) + (classes >= 3 ? 1 : 0);
  if (/(.)\1{3,}/u.test(pw)) score -= 1;
  const level = Math.max(1, Math.min(4, score)) as 1 | 2 | 3 | 4;
  return { level, label: ["", "Weak", "Fair", "Good", "Strong"][level] };
}

// First and last name are asked for separately on the sign-up page.
export function checkNamePart(raw: string, which: "first" | "last"): string | null {
  const v = raw.normalize("NFC").replace(/\s+/g, " ").trim();
  if (!v) return `Enter your ${which} name.`;
  if (!/^[\p{L}\p{M} '’.-]+$/u.test(v) || !/\p{L}/u.test(v)) {
    return "Use letters, spaces, hyphens, apostrophes and full stops only.";
  }
  if (count(v) > 40) return "That name is too long.";
  return null;
}
