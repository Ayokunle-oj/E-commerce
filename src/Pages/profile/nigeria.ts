// The 36 states plus the Federal Capital Territory, as shown in the address form.
export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Federal Capital Territory",
  "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
  "Taraba", "Yobe", "Zamfara",
] as const;

/**
 * Accepts 0803 123 4567, 08031234567, 2348031234567 and +234 803 123 4567.
 * Returns the number as +234XXXXXXXXXX, or null if it is not a valid Nigerian mobile number.
 */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/[\s\-().]/g, "");
  let national: string;
  if (/^\+234\d{10}$/.test(digits)) national = digits.slice(4);
  else if (/^234\d{10}$/.test(digits)) national = digits.slice(3);
  else if (/^0\d{10}$/.test(digits)) national = digits.slice(1);
  else return null;
  // Mobile prefixes: 070x, 080x, 081x, 090x, 091x
  return /^[789][01]\d{8}$/.test(national) ? `+234${national}` : null;
}

/** +2348031234567 becomes "0803 123 4567". Anything unrecognised is returned as it came. */
export function formatPhone(phone: string): string {
  const normalized = normalizePhone(phone);
  if (!normalized) return phone;
  const local = `0${normalized.slice(4)}`;
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
}

export function isValidEmail(email: string): boolean {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/** Two display lines for an address: street first, then area, city and state. */
export function addressLines(address: {
  street: string;
  extra: string;
  area: string;
  city: string;
  state: string;
}): [string, string] {
  const first = address.extra ? `${address.street}, ${address.extra}` : address.street;
  return [first, `${address.area}, ${address.city}, ${address.state}`];
}
