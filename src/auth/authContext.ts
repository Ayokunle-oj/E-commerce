import { createContext, useContext } from "react";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone: string | null; // +234XXXXXXXXXX or as typed
  avatarUrl: string | null;
  createdAt: string; // ISO date
}

export type AuthResult =
  | { ok: true; needsVerification?: boolean }
  | { ok: false; message: string };

export interface SignInValues {
  email: string;
  password: string;
  remember: boolean;
}
export interface SignUpValues {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
}

export interface AuthContextValue {
  /** The signed-in customer, or null for a guest. */
  user: AuthUser | null;
  signIn: (values: SignInValues) => Promise<AuthResult>;
  signUp: (values: SignUpValues) => Promise<AuthResult>;
  signOut: () => void;
  /** Keeps the name and photo in the navs up to date after the customer edits their profile. */
  updateUser: (
    patch: Partial<
      Pick<AuthUser, "fullName" | "email" | "phone" | "avatarUrl">
    >,
  ) => void;
  /**
   * Call this before anything a guest may not do (add to cart, save to wishlist).
   * Signed in: returns true. Guest: opens the "Sign in to continue" sheet with `reason`
   * and returns false, so the caller stops.
   */
  requireAuth: (reason: string) => boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside <AuthProvider>");
  return value;
}
