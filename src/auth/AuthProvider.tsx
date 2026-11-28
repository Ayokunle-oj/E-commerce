import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  AuthContext,
  type AuthContextValue,
  type AuthUser,
} from "./authContext";
import { demoServer } from "../demo/demoServer";
import SignInPrompt from "../Components/auth/SignInPrompt";

/**
 * Holds who is signed in, and the "Sign in to continue" sheet that guests see when they
 * try something that needs an account. Must sit inside <BrowserRouter> (the sheet has links).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() =>
    demoServer.restoreSession(),
  );
  const [promptReason, setPromptReason] = useState<string | null>(null);

  const signIn = useCallback<AuthContextValue["signIn"]>(async (values) => {
    const result = await demoServer.signIn(values);
    if (!result.ok) return result;
    setUser(result.user);
    setPromptReason(null);
    return { ok: true };
  }, []);

  const signUp = useCallback<AuthContextValue["signUp"]>(async (values) => {
    const result = await demoServer.signUp(values);
    if (!result.ok) return result;
    setUser(result.user);
    setPromptReason(null);
    return { ok: true, needsVerification: result.needsVerification };
  }, []);

  const signOut = useCallback(() => {
    demoServer.signOut();
    setUser(null);
  }, []);

  const updateUser = useCallback<AuthContextValue["updateUser"]>((patch) => {
    setUser((current) => (current ? { ...current, ...patch } : current));
  }, []);

  const requireAuth = useCallback(
    (reason: string) => {
      if (user) return true;
      setPromptReason(reason);
      return false;
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, signIn, signUp, signOut, updateUser, requireAuth }),
    [user, signIn, signUp, signOut, updateUser, requireAuth],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <SignInPrompt
        reason={promptReason}
        onClose={() => setPromptReason(null)}
      />
    </AuthContext.Provider>
  );
}
