import { useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { BRAND_NAME } from "../../data/brand"; // adjust this path if you put the file elsewhere
import { AuthField, PasswordField, SocialButtons } from "./AuthField";
import { checkEmail, normalizeEmail } from "./authValidation";
import "./auth.css";

export type AuthResult = { ok: true } | { ok: false; message: string };

interface LoginProps {
  // Call your sign-in API here. Navigate on success inside this function.
  onSubmit?: (v: { email: string; password: string; remember: boolean }) => Promise<AuthResult>;
  onGoogle?: () => void;
  onApple?: () => void;
}

export default function Login({ onSubmit, onGoogle, onApple }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const busy = useRef(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy.current) return; // no double submits
    const next = { email: checkEmail(email) ?? undefined, password: password ? undefined : "Enter your password." };
    setErrors(next);
    setFormError(null);
    if (next.email || next.password) return;

    if (!onSubmit) {
      setFormError("Sign-in isn't connected to a server yet.");
      return;
    }
    busy.current = true;
    setPending(true);
    try {
      const result = await onSubmit({ email: normalizeEmail(email), password, remember });
      if (!result.ok) setFormError(result.message);
    } catch {
      setFormError("We couldn't connect right now. Check your internet connection and try again.");
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  return (
    <div className="auth-page">
      <header className="auth-page__bar">
        <Link to="/" className="auth-page__brand">{BRAND_NAME}</Link>
        <Link to="/" className="auth-page__back">Back to store</Link>
      </header>

      <div className="auth-page__body">
        <div className="auth-page__column">
          <section className="auth-panel" aria-labelledby="login-title">
            <h1 id="login-title" className="auth-panel__title">Welcome back.</h1>
            <p className="auth-panel__subtitle">Sign in to continue your shopping experience.</p>

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
                {pending ? "Signing in…" : "Log in"}
              </button>
            </form>

            <SocialButtons onGoogle={onGoogle} onApple={onApple} />

            <p className="auth-switch">
              New to {BRAND_NAME}? <Link to="/signup" className="auth-link">Create an account</Link>
            </p>
          </section>
          <p className="auth-legal">
            By continuing you agree to our <Link to="/terms" className="auth-link">Terms</Link> and{" "}
            <Link to="/privacy" className="auth-link">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
