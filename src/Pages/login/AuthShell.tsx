import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { BRAND_NAME } from "../../data/brand";
import "./auth.css";

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

// The frame of the login and sign-up pages: a coloured banner with the title,
// and a white rounded sheet that rises over it and holds the form.
function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <header className="auth-banner">
          <span className="auth-banner__shape auth-banner__shape--sun" aria-hidden="true" />
          <span className="auth-banner__shape auth-banner__shape--leaf" aria-hidden="true" />
          <Link to="/" className="auth-banner__back" aria-label="Back to store">
            <ArrowLeft size={20} aria-hidden="true" />
          </Link>
          <p className="auth-banner__brand">{BRAND_NAME}</p>
          <h1 className="auth-banner__title">{title}</h1>
          {subtitle && <p className="auth-banner__subtitle">{subtitle}</p>}
        </header>
        <div className="auth-sheet">{children}</div>
      </div>
    </div>
  );
}

export default AuthShell;
