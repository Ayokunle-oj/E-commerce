import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";

interface BaseProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  children?: ReactNode;
}
type NativeProps = Omit<InputHTMLAttributes<HTMLInputElement>, keyof BaseProps | "trailing">;
type FieldProps = BaseProps & NativeProps & { trailing?: ReactNode };

export function AuthField({ label, value, onChange, error, hint, trailing, children, ...rest }: FieldProps) {
  const id = useId();
  return (
    <div className={`auth-field${error ? " auth-field--error" : ""}`}>
      <label className="auth-field__label" htmlFor={id}>{label}</label>
      <div className="auth-field__control">
        <input
          {...rest}
          id={id}
          className="auth-field__input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
        />
        {trailing}
      </div>
      {error ? (
        <p id={`${id}-err`} className="auth-field__error" role="alert">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="auth-field__hint">{hint}</p>
      ) : null}
      {children}
    </div>
  );
}

// Show / Hide toggle. Pasting and password managers are never blocked.
export function PasswordField(props: BaseProps & Omit<NativeProps, "type">) {
  const [shown, setShown] = useState(false);
  return (
    <AuthField
      {...props}
      type={shown ? "text" : "password"}
      autoCapitalize="none"
      spellCheck={false}
      trailing={
        <button type="button" className="auth-field__toggle" onClick={() => setShown((s) => !s)} aria-pressed={shown}>
          {shown ? "Hide" : "Show"}
          <span className="auth-sr-only"> password</span>
        </button>
      }
    />
  );
}

// Buttons stay disabled until you pass a handler, so nothing pretends to work.
export function SocialButtons({ onGoogle, onApple }: { onGoogle?: () => void; onApple?: () => void }) {
  const noteId = useId();
  const missing = !onGoogle || !onApple;
  return (
    <div className="auth-social">
      <div className="auth-divider" role="separator"><span>or</span></div>
      <button type="button" className="auth-btn auth-btn--outline" aria-disabled={!onGoogle || undefined}
        aria-describedby={missing ? noteId : undefined} onClick={() => onGoogle?.()}>
        <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
        Continue with Google
      </button>
      <button type="button" className="auth-btn auth-btn--outline" aria-disabled={!onApple || undefined}
        aria-describedby={missing ? noteId : undefined} onClick={() => onApple?.()}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
        </svg>
        Continue with Apple
      </button>
      {missing && <p id={noteId} className="auth-social__note">Google and Apple sign-in aren't connected yet.</p>}
    </div>
  );
}
