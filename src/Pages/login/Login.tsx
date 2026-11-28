import { useRef, useState, type FormEvent } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { BRAND_NAME } from "../../data/brand";
import { useAuth } from "../../auth/authContext";
import { returnPathFrom } from "../../auth/returnPath";
import AuthShell from "./AuthShell";
import { AuthField, PasswordField, SocialButtons } from "./AuthField";
import { checkEmail, normalizeEmail } from "./authValidation";

interface LoginProps {
  onGoogle?: () => void;
  onApple?: () => void;
}

export default function Login({ onGoogle, onApple }: LoginProps) {
  const { user, signIn } = useAuth();
  const { state } = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const busy = useRef(false);

  // Already signed in, or just signed in: go back to where the customer came from.
  if (user) return <Navigate to={returnPathFrom(state)} replace />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy.current) return; // no double submits
    const next = { email: checkEmail(email) ?? undefined, password: password ? undefined : "Enter your password." };
    setErrors(next);
    setFormError(null);
    if (next.email || next.password) return;

    busy.current = true;
    setPending(true);
    try {
      const result = await signIn({ email: normalizeEmail(email), password, remember });
      if (!result.ok) setFormError(result.message);
    } catch {
      setFormError("We couldn't connect right now. Check your internet connection and try again.");
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Log in to continue your shopping.">
      <SocialButtons onGoogle={onGoogle} onApple={onApple} />

      {formError && <div className="auth-alert" role="alert">{formError}</div>}

      <form className="auth-form" onSubmit={submit} noValidate>
        <AuthField
          label="Email address"
          type="email"
          inputMode="email"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          value={email}
          onChange={(v) => { setEmail(v); setErrors((c) => ({ ...c, email: undefined })); }}
          error={errors.email}
        />
        <PasswordField
          label="Password"
          autoComplete="current-password"
          value={password}
          onChange={(v) => { setPassword(v); setErrors((c) => ({ ...c, password: undefined })); }}
          error={errors.password}
        />
        <div className="auth-row">
          <label className="auth-check">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Remember me
          </label>
          <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
        </div>
        <button type="submit" className="auth-btn auth-btn--primary" disabled={pending} aria-busy={pending || undefined}>
          {pending ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="auth-switch">
        New to {BRAND_NAME}? <Link to="/signup" state={state} className="auth-link">Create an account</Link>
      </p>
      <p className="auth-legal">
        By continuing you agree to our <Link to="/terms" className="auth-link">Terms</Link> and{" "}
        <Link to="/privacy" className="auth-link">Privacy Policy</Link>.
      </p>
    </AuthShell>
  );
}
