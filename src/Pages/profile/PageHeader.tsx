import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  /** The back button is shown on phones only. Pass false on the account home. */
  backTo?: string | false;
  /** Buttons at the end of the heading row. */
  actions?: ReactNode;
}

/** The single h1 of every account page. Also sets the browser tab title. */
function PageHeader({ title, description, backTo = "/account", actions }: PageHeaderProps) {
  useEffect(() => {
    const previous = document.title;
    document.title = `${title} · Account · Quikit`;
    return () => {
      document.title = previous;
    };
  }, [title]);

  return (
    <header className="page-header">
      {backTo !== false && (
        <Link className="page-header__back" to={backTo} aria-label="Back to account">
          <ArrowLeft size={20} aria-hidden="true" />
        </Link>
      )}
      <div className="page-header__text">
        {/* tabIndex -1: the layout moves focus here after navigating, for keyboard and screen-reader users */}
        <h1 className="page-header__title" tabIndex={-1}>
          {title}
        </h1>
        {description && <p className="page-header__description">{description}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>
  );
}

export default PageHeader;
