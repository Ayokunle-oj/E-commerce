// ═════════════════════════════════════════════════════════════════════════════
// DEMO SERVER. A pretend backend that lives in the browser. THIS IS THE ONLY FILE WITH DEMO DATA.
//
// What it does: keeps accounts, profiles, addresses, carts and wishlists in localStorage, answers
// the same questions a real API will (sign in, save profile, add address, load cart...), and waits
// a moment before answering so loading states can be seen.
//
// Not secure, not shared: the data exists only in this browser. Never ship it to customers.
//
// DEMO LOGIN (created the first time the app runs):  demo@fimba.test  /  demo-password-2026
// Any account you create on the sign-up page is also kept here, with an empty cart.
//
// BROWSER CONSOLE (dev server only):
//   demoServer.reset()       wipe everything and start again from the seed data
//   demoServer.failNext(2)   make the next 2 requests fail, to test error messages
//
// TO CONNECT THE REAL BACKEND: keep the function names and the shapes they take and return,
// and replace each body with a request to the API. Nothing outside this file needs to change,
// except that the functions marked "sync" below will become async (they only read), so
// their callers will need a loading state.
// ═════════════════════════════════════════════════════════════════════════════
import { products } from "../Components/products/products";
import type { Product } from "../types/product";
import type { CartLine } from "../types/cart";
import type { AuthUser, SignInValues, SignUpValues } from "../auth/authContext";
import type {
  Address,
  AddressValues,
  Profile,
  ProfileValues,
} from "../Pages/profile/AccountContext";

export const DEMO_LOGIN = { email: "demo@fimba.test", password: "demo-password-2026" };

const LATENCY_MS = 450; // how long each pretend request takes
const DB_KEY = "fimba.demo.db";
const SESSION_KEY = "fimba.demo.session";
const DB_VERSION = 1;

// ── Seed data: what the demo account starts with ─────────────────────────────
const DEMO_USER_ID = "user_demo";
const SEED_PROFILE = {
  fullName: "David Adeyemi",
  email: DEMO_LOGIN.email,
  phone: "+2348031234567",
  createdAt: "2026-03-12",
};
const SEED_ADDRESSES: Address[] = [
  {
    id: "addr-seed-1",
    label: "Home",
    fullName: "David Adeyemi",
    phone: "+2348031234567",
    state: "Oyo",
    city: "Ibadan",
    area: "Bodija",
    street: "14 Oluyole Crescent, off Ring Road",
    extra: "Block B, Flat 3",
    instructions: "Call when you reach the gate. The security man will let you in.",
    isDefault: true,
  },
  {
    id: "addr-seed-2",
    label: "Work",
    fullName: "David Adeyemi",
    phone: "+2348031234567",
    state: "Lagos",
    city: "Ikeja",
    area: "Allen Avenue",
    street: "27 Allen Avenue",
    extra: "3rd floor, Suite 12",
    instructions: "",
    isDefault: false,
  },
];
const SEED_CART: StoredCart = {
  lines: [
    { productId: "p01", quantity: 1, addedBy: DEMO_USER_ID },
    { productId: "p06", quantity: 2, addedBy: DEMO_USER_ID },
    { productId: "p07", quantity: 1, addedBy: DEMO_USER_ID },
    { productId: "p19", quantity: 1, addedBy: DEMO_USER_ID },
  ],
  wishlist: ["p12", "p24"],
};

// ── How the data is stored (this is the shape the real database will have) ───
interface StoredAccount extends AuthUser {
  salt: string;
  passwordHash: string;
}
interface StoredCart {
  lines: { productId: string; quantity: number; addedBy: string }[];
  wishlist: string[]; // product ids
}
interface Db {
  version: number;
  accounts: StoredAccount[];
  addresses: Record<string, Address[]>; // by user id
  carts: Record<string, StoredCart>; // by user id
}

type ServiceResult =
  | { ok: true; user: AuthUser | null; needsVerification?: boolean }
  | { ok: false; message: string };

// ── Small helpers ────────────────────────────────────────────────────────────
const STORAGE_BLOCKED =
  "Your browser is blocking storage, so we can't keep you signed in. Turn off private browsing or allow site data and try again.";

const wait = (ms = LATENCY_MS) => new Promise<void>((resolve) => setTimeout(resolve, ms));

let failures = 0;
async function request(ms = LATENCY_MS) {
  await wait(ms);
  if (failures > 0) {
    failures -= 1;
    throw new Error("Demo server: simulated network failure.");
  }
}

const randomHex = (bytes: number) =>
  Array.from(crypto.getRandomValues(new Uint8Array(bytes)), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");

// SHA-256 where the browser allows it. Plain http (for example opening the dev server on a
// phone by IP address) has no crypto.subtle, so a weak fallback is used. Demo only.
async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  if (globalThis.crypto?.subtle) {
    const digest = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
  }
  let h = 5381;
  for (const byte of data) h = ((h * 33) ^ byte) >>> 0;
  return `weak-${h.toString(16)}`;
}

function readDb(): Db | null {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return null;
    const db = JSON.parse(raw) as Db;
    return db.version === DB_VERSION ? db : null;
  } catch {
    return null;
  }
}

function writeDb(db: Db) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    throw new Error("Your browser's storage is full or blocked, so the change could not be saved.");
  }
}

/** The database, created from the seed data on first use. */
async function openDb(): Promise<Db> {
  const existing = readDb();
  if (existing) return existing;
  const salt = randomHex(16);
  const db: Db = {
    version: DB_VERSION,
    accounts: [
      {
        id: DEMO_USER_ID,
        ...SEED_PROFILE,
        avatarUrl: null,
        salt,
        passwordHash: await hashPassword(DEMO_LOGIN.password, salt),
      },
    ],
    addresses: { [DEMO_USER_ID]: SEED_ADDRESSES },
    carts: { [DEMO_USER_ID]: SEED_CART },
  };
  writeDb(db);
  return db;
}

function toUser(account: StoredAccount): AuthUser {
  const { id, fullName, email, phone, avatarUrl, createdAt } = account;
  return { id, fullName, email, phone, avatarUrl, createdAt };
}

const toProfile = ({ fullName, email, phone, avatarUrl, createdAt }: StoredAccount): Profile => ({
  fullName,
  email,
  phone,
  avatarUrl,
  createdAt,
});

function findAccount(db: Db, userId: string): StoredAccount {
  const account = db.accounts.find((a) => a.id === userId);
  if (!account) throw new Error("Demo server: no such account.");
  return account;
}

function setSession(id: string, remember: boolean) {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, id);
}

// A photo becomes a small square JPEG (256 px), so it is light enough to store and survives a refresh.
async function toAvatarDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const size = 256;
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process that image.");
  ctx.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    size,
    size,
  );
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85);
}

const newAddressId = () => `addr-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

// ── The server ───────────────────────────────────────────────────────────────
export const demoServer = {
  // ── Sign in ────────────────────────────────────────────────────────────────
  /** (sync) Who was already signed in when the page loaded. */
  restoreSession(): AuthUser | null {
    try {
      const id = sessionStorage.getItem(SESSION_KEY) ?? localStorage.getItem(SESSION_KEY);
      const account = id ? readDb()?.accounts.find((a) => a.id === id) : undefined;
      return account ? toUser(account) : null;
    } catch {
      return null;
    }
  },

  async signIn({ email, password, remember }: SignInValues): Promise<ServiceResult> {
    try {
      await request();
      const db = await openDb();
      const account = db.accounts.find((a) => a.email === email);
      // One message for "no such email" and "wrong password", so it does not reveal which emails exist.
      const wrong: ServiceResult = { ok: false, message: "Email or password is incorrect." };
      if (!account) return wrong;
      if ((await hashPassword(password, account.salt)) !== account.passwordHash) return wrong;
      setSession(account.id, remember);
      return { ok: true, user: toUser(account) };
    } catch {
      return { ok: false, message: STORAGE_BLOCKED };
    }
  },

  async signUp({ fullName, email, phone, password }: SignUpValues): Promise<ServiceResult> {
    try {
      await request();
      const db = await openDb();
      // Demo behaviour. With a real backend, show the same "check your email" result
      // whether or not the address already exists.
      if (db.accounts.some((a) => a.email === email)) {
        return { ok: false, message: "An account with this email already exists. Try logging in instead." };
      }
      const salt = randomHex(16);
      const account: StoredAccount = {
        id: `user-${randomHex(8)}`,
        fullName,
        email,
        phone: phone ?? null,
        avatarUrl: null,
        createdAt: new Date().toISOString().slice(0, 10),
        salt,
        passwordHash: await hashPassword(password, salt),
      };
      writeDb({
        ...db,
        accounts: [...db.accounts, account],
        addresses: { ...db.addresses, [account.id]: [] },
        carts: { ...db.carts, [account.id]: { lines: [], wishlist: [] } },
      });
      setSession(account.id, true);
      // The demo has no email step, so the new customer is signed in straight away.
      return { ok: true, user: toUser(account) };
    } catch {
      return { ok: false, message: STORAGE_BLOCKED };
    }
  },

  signOut() {
    try {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* nothing stored, nothing to clear */
    }
  },

  // ── Account: profile and addresses ─────────────────────────────────────────
  /** (sync) The customer's profile and address book. */
  getAccount(userId: string): { profile: Profile; addresses: Address[] } {
    const db = readDb();
    if (!db) throw new Error("Demo server: no data yet.");
    return { profile: toProfile(findAccount(db, userId)), addresses: db.addresses[userId] ?? [] };
  },

  async updateProfile(userId: string, values: ProfileValues): Promise<Profile> {
    await request();
    const db = await openDb();
    const account = findAccount(db, userId);
    if (db.accounts.some((a) => a.id !== userId && a.email === values.email)) {
      throw new Error("That email is already used by another account.");
    }
    const updated = { ...account, ...values };
    writeDb({ ...db, accounts: db.accounts.map((a) => (a.id === userId ? updated : a)) });
    return toProfile(updated);
  },

  /** Pass a photo, or null to remove it. */
  async saveAvatar(userId: string, file: File | null): Promise<Profile> {
    await request();
    const avatarUrl = file ? await toAvatarDataUrl(file) : null;
    const db = await openDb();
    const updated = { ...findAccount(db, userId), avatarUrl };
    writeDb({ ...db, accounts: db.accounts.map((a) => (a.id === userId ? updated : a)) });
    return toProfile(updated);
  },

  /** Adds an address, or updates the one with `id`. */
  async saveAddress(userId: string, values: AddressValues, id?: string): Promise<Address> {
    await request();
    const db = await openDb();
    const current = db.addresses[userId] ?? [];
    const existing = current.find((a) => a.id === id);
    // The first address is always the default, and a default cannot be un-set directly:
    // choose another address as the default instead.
    const isDefault = values.isDefault || current.length === 0 || Boolean(existing?.isDefault);
    const saved: Address = { ...values, id: id ?? newAddressId(), isDefault };
    const cleared = isDefault ? current.map((a) => ({ ...a, isDefault: false })) : current;
    // An edited address keeps its place; a new one goes to the end.
    const next = existing
      ? cleared.map((a) => (a.id === saved.id ? saved : a))
      : [...cleared, saved];
    writeDb({ ...db, addresses: { ...db.addresses, [userId]: next } });
    return saved;
  },

  async deleteAddress(userId: string, id: string): Promise<void> {
    await request();
    const db = await openDb();
    const remaining = (db.addresses[userId] ?? []).filter((a) => a.id !== id);
    // If the default was deleted, the first remaining address takes over.
    if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
      remaining[0] = { ...remaining[0], isDefault: true };
    }
    writeDb({ ...db, addresses: { ...db.addresses, [userId]: remaining } });
  },

  async setDefaultAddress(userId: string, id: string): Promise<void> {
    await request(250);
    const db = await openDb();
    const next = (db.addresses[userId] ?? []).map((a) => ({ ...a, isDefault: a.id === id }));
    writeDb({ ...db, addresses: { ...db.addresses, [userId]: next } });
  },

  // ── Cart and wishlist ──────────────────────────────────────────────────────
  // Stored as product ids and quantities, and joined with the product list on the way out,
  // which is what the real API will do too.

  /** (sync) The customer's cart lines and wishlist. */
  loadCart(userId: string): { items: CartLine[]; wishlist: Product[] } {
    const stored = readDb()?.carts[userId];
    const byId = new Map(products.map((p) => [p.id, p]));
    const items = (stored?.lines ?? []).flatMap((line) => {
      const product = byId.get(line.productId);
      if (!product) return [];
      const quantity = Math.max(1, Math.min(line.quantity, product.stock));
      return [{ ...product, quantity, addedBy: line.addedBy }];
    });
    const wishlist = (stored?.wishlist ?? []).flatMap((id) => {
      const product = byId.get(id);
      return product ? [product] : [];
    });
    return { items, wishlist };
  },

  /** (sync) Saves the cart after every change. */
  saveCart(userId: string, cart: { items: CartLine[]; wishlist: Product[] }) {
    const db = readDb();
    if (!db || !db.accounts.some((a) => a.id === userId)) return;
    try {
      writeDb({
        ...db,
        carts: {
          ...db.carts,
          [userId]: {
            lines: cart.items.map((i) => ({
              productId: i.id,
              quantity: i.quantity,
              addedBy: i.addedBy,
            })),
            wishlist: cart.wishlist.map((p) => p.id),
          },
        },
      });
    } catch {
      /* storage full: the cart still works for this visit */
    }
  },

  // ── Testing tools ──────────────────────────────────────────────────────────
  /** Wipes all demo data and signs everyone out. Reload the page afterwards. */
  reset() {
    localStorage.removeItem(DB_KEY);
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  },

  /** Makes the next `count` requests fail, to test the error messages. */
  failNext(count = 1) {
    failures = count;
  },
};

if (import.meta.env.DEV) {
  (globalThis as unknown as { demoServer: typeof demoServer }).demoServer = demoServer;
}
