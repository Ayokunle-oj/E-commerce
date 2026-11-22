import type { ReactNode } from "react";
import { Inbox, type LucideIcon } from "lucide-react";
import "./emptyState.css";

interface EmptyStateProps {
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
  icon?: LucideIcon;
  /** Smaller, borderless version for use inside a card. */
  compact?: boolean;
}

/** "Nothing here yet", with a next step. */
function EmptyState({ title, children, actions, icon: Icon = Inbox, compact = false }: EmptyStateProps) {
  return (
    <div className={`empty-state${compact ? " empty-state--compact" : ""}`}>
      <span className="empty-state__icon" aria-hidden="true">
        <Icon size={compact ? 22 : 28} />
      </span>
      <p className="empty-state__title">{title}</p>
      {children && <p className="empty-state__text">{children}</p>}
      {actions && <div className="empty-state__actions">{actions}</div>}
    </div>
  );
}

export default EmptyState;
