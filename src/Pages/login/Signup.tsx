import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { BRAND_NAME } from "../../data/brand"; // adjust this path if you put the file elsewhere
import { AuthField, PasswordField, SocialButtons } from "./AuthField";
import { checkEmail, checkName, checkPassword, checkPhone, normalizeEmail, passwordStrength } from "./authValidation";
import type { AuthResult } from "./Login";
import "./auth.css";

interface SignupProps {
  // Call your sign-up API here. Show the same result whether or not the email already exists.
  onSubmit?: (v: { fullName: string; email: string; phone?: string; password: string }) => Promise<AuthResult>;
  onGoogle?: () => void;
  onApple?: () => void;
}

type Field = "fullName" | "email" | "phone" | "password" | "confirm" | "terms";

export default function Signup({ onSubmit, onGoogle, onApple }: SignupProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const busy = useRef(false);

  const clear = (f: Field) => setErrors((c) => ({ ...c, [f]: undefined }));
  const strength = passwordStrength(password);
  const mismatch = confirm && confirm !== password ? "Passwords don't match." : undefined;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy.current) return;
    const next: Partial<Record<Field, string>> = {
      fullName: checkName(fullName) ?? undefined,
      email: checkEmail(email) ?? undefined,
      phone: checkPhone(phone) ?? undefined,
      password: checkPassword(password, email, fullName) ?? undefined,
      confirm: !confirm ? "Confirm your password." : confirm !== password ? "Passwords don't match." : undefined,
      terms: terms ? undefined : "Please accept the Terms and Privacy Policy to continue.",
    };
    setErrors(next);
    setFormError(null);
    if (Object.values(next).some(Boolean)) return;

    if (!onSubmit) {
      setFormError("Sign-up isn't connected to a server yet.");
      return;
    }
    busy.current = true;
    setPending(true);
    try {
      const result = await onSubmit({
        fullName: fullName.normalize("NFC").replace(/\s+/g, " ").trim(),
        email: normalizeEmail(email),
        phone: phone.trim() || undefined,
        password,
      });
      if (result.ok) {
        setSentTo(normalizeEmail(email));
        setPassword("");
        setConfirm("");
      } else {
        setFormError(result.message);
      }
    } catch {
      setFormError("We couldn't connect right now. Check your internet connection and try again.");
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  const frame = (children: ReactNode) => (
    <div className="auth-page">
      <header className="auth-page__bar">
        <Link to="/" className="auth-page__brand">{BRAND_NAME}</Link>
        <Link to="/" className="auth-page__back">Back to store</Link>
      </header>
      <div className="auth-page__body">
        <div className="auth-page__column">{children}</div>
      </div>
    </div>
  );

  if (sentTo) {
    return frame(
      <section className="auth-panel" aria-labelledby="signup-sent">
        <h1 id="signup-sent" className="auth-panel__title">Check your email</h1>
        <p className="auth-panel__subtitle">
          We've sent a message to <strong>{sentTo}</strong>. Follow the link inside to verify your email address.
        </p>
        <Link to="/login" className="auth-btn auth-btn--primary">Continue to log in</Link>
      </section>,
    );
  }

  return frame(
    <>
      <section className="auth-panel" aria-labelledby="signup-title">
        <h1 id="signup-title" className="auth-panel__title">Create your {BRAND_NAME} account.</h1>
        <p className="auth-panel__subtitle">Join {BRAND_NAME} and enjoy a simpler, smarter way to shop.</p>

        {formError && <div className="auth-alert" role="alert">{formError}</div>}

        <form className="auth-form" onSubmit={submit} noValidate>
          <AuthField label="Full name" autoComplete="name" value={fullName} maxLength={120}
            onChange={(v) => { setFullName(v); clear("fullName"); }} error={errors.fullName} />
          <AuthField label="Email address" type="email" inputMode="email" autoComplete="email"
            autoCapitalize="none" spellCheck={false} value={email} maxLength={254}
            onChange={(v) => { setEmail(v); clear("email"); }} error={errors.email} />
          <AuthField label="Phone number (optional)" type="tel" inputMode="tel" autoComplete="tel" value={phone} maxLength={24}
            hint="You can add or change this later in your account settings."
            onChange={(v) => { setPhone(v); clear("phone"); }} error={errors.phone} />

          <PasswordField label="Password" autoComplete="new-password" value={password}
            onChange={(v) => { setPassword(v); clear("password"); }} error={errors.password}>
            {password ? (
              <div className="auth-strength" data-level={strength.level}>
                <div className="auth-strength__bars" aria-hidden="true"><span /><span /><span /><span /></div>
                <p className="auth-strength__text">Password strength: <strong aria-live="polite">{strength.label}</strong></p>
              </div>
            ) : (
              <p className="auth-field__hint">Use at least 12 characters. A phrase of several words works well.</p>
            )}
          </PasswordField>

          <PasswordField label="Confirm password" autoComplete="new-password" value={confirm}
            onChange={(v) => { setConfirm(v); clear("confirm"); }} error={errors.confirm ?? mismatch} />

          <div className="auth-field">
            <label className="auth-check">
              <input type="checkbox" checked={terms} onChange={(e) => { setTerms(e.target.checked); clear("terms"); }}
                aria-invalid={errors.terms ? true : undefined} />
              <span>
                I agree to the <Link to="/terms" className="auth-link">Terms and Conditions</Link> and have read
                the <Link to="/privacy" className="auth-link">Privacy Policy</Link>.
              </span>
            </label>
            {errors.terms && <p className="auth-field__error" role="alert">{errors.terms}</p>}
          </div>

          <button type="submit" className="auth-btn auth-btn--primary" disabled={pending} aria-busy={pending || undefined}>
            {pending ? "Creating account…" : "Create account"}
          </button>
        </form>

        <SocialButtons onGoogle={onGoogle} onApple={onApple} />

        <p className="auth-switch">
          Already have an account? <Link to="/login" className="auth-link">Log in</Link>
        </p>
      </section>
    </>,
  );
}
