import { useRef, useState, type FormEvent } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { BRAND_NAME } from "../../data/brand";
import { useAuth } from "../../auth/authContext";
import { returnPathFrom } from "../../auth/returnPath";
import AuthShell from "./AuthShell";
import { AuthField, PasswordField, SocialButtons } from "./AuthField";
import {
  checkEmail, checkNamePart, checkPassword, checkPhone, normalizeEmail, passwordStrength,
} from "./authValidation";

interface SignupProps {
  onGoogle?: () => void;
  onApple?: () => void;
}

type Field = "firstName" | "lastName" | "email" | "phone" | "password" | "confirm" | "terms";

const tidy = (s: string) => s.normalize("NFC").replace(/\s+/g, " ").trim();

export default function Signup({ onGoogle, onApple }: SignupProps) {
  const { user, signUp } = useAuth();
  const { state } = useLocation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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

  // Signed in (including right after creating the account): go back to where the customer came from.
  if (user && !sentTo) return <Navigate to={returnPathFrom(state)} replace />;

  const clear = (f: Field) => setErrors((c) => ({ ...c, [f]: undefined }));
  const strength = passwordStrength(password);
  const mismatch = confirm && confirm !== password ? "Passwords don't match." : undefined;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy.current) return;
    const fullName = `${tidy(firstName)} ${tidy(lastName)}`;
    const next: Partial<Record<Field, string>> = {
      firstName: checkNamePart(firstName, "first") ?? undefined,
      lastName: checkNamePart(lastName, "last") ?? undefined,
      email: checkEmail(email) ?? undefined,
      phone: checkPhone(phone) ?? undefined,
      password: checkPassword(password, email, fullName) ?? undefined,
      confirm: !confirm ? "Confirm your password." : confirm !== password ? "Passwords don't match." : undefined,
      terms: terms ? undefined : "Please accept the Terms and Privacy Policy to continue.",
    };
    setErrors(next);
    setFormError(null);
    if (Object.values(next).some(Boolean)) return;

    busy.current = true;
    setPending(true);
    try {
      const result = await signUp({
        fullName,
        email: normalizeEmail(email),
        phone: phone.trim() || undefined,
        password,
      });
      if (!result.ok) {
        setFormError(result.message);
      } else if (result.needsVerification) {
        setSentTo(normalizeEmail(email));
        setPassword("");
        setConfirm("");
      }
      // Otherwise the customer is now signed in and the redirect above takes over.
    } catch {
      setFormError("We couldn't connect right now. Check your internet connection and try again.");
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  if (sentTo) {
    return (
      <AuthShell title="Check your email">
        <p className="auth-lead">
          We've sent a message to <strong>{sentTo}</strong>. Follow the link inside to verify your email address.
        </p>
        <Link to="/login" state={state} className="auth-btn auth-btn--primary">Continue to log in</Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Create an account" subtitle={`Join ${BRAND_NAME} and shop the simple way.`}>
      <SocialButtons onGoogle={onGoogle} onApple={onApple} />

      {formError && <div className="auth-alert" role="alert">{formError}</div>}

      <form className="auth-form" onSubmit={submit} noValidate>
        <div className="auth-form__pair">
          <AuthField label="First name" autoComplete="given-name" value={firstName} maxLength={60}
            onChange={(v) => { setFirstName(v); clear("firstName"); }} error={errors.firstName} />
          <AuthField label="Last name" autoComplete="family-name" value={lastName} maxLength={60}
            onChange={(v) => { setLastName(v); clear("lastName"); }} error={errors.lastName} />
        </div>
        <AuthField label="Email address" type="email" inputMode="email" autoComplete="email"
          autoCapitalize="none" spellCheck={false} value={email} maxLength={254}
          onChange={(v) => { setEmail(v); clear("email"); }} error={errors.email} />
        <AuthField label="Phone number (optional)" type="tel" inputMode="tel" autoComplete="tel" value={phone} maxLength={24}
          hint="You can add or change this later in your account."
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

      <p className="auth-switch">
        Have an account? <Link to="/login" state={state} className="auth-link">Log in here</Link>
      </p>
    </AuthShell>
  );
}
