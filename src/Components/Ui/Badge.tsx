import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import "./badge.css";

interface BadgeProps {
  tone?: "neutral" | "info" | "success" | "warning" | "error";
  icon?: LucideIcon;
  children: ReactNode;
}

/** A small status label. Always carries text, so meaning never depends on colour alone. */
function Badge({ tone = "neutral", icon: Icon, children }: BadgeProps) {
  return (
    <span className={`badge badge--${tone}`}>
      {Icon && <Icon size={14} aria-hidden="true" />}
      {children}
    </span>
  );
}

export default Badge;
