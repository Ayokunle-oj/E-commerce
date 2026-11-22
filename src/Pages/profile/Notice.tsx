import { CircleAlert, CircleCheck, X } from "lucide-react";

interface NoticeProps {
  tone: "success" | "error";
  children: string;
  onDismiss?: () => void;
}

/** A message about something that just happened. Announced to screen readers. */
function Notice({ tone, children, onDismiss }: NoticeProps) {
  const Icon = tone === "success" ? CircleCheck : CircleAlert;
  return (
    <div className={`notice notice--${tone}`} role={tone === "error" ? "alert" : "status"}>
      <Icon size={18} aria-hidden="true" />
      <p className="notice__text">{children}</p>
      {onDismiss && (
        <button type="button" className="notice__close" aria-label="Dismiss message" onClick={onDismiss}>
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export default Notice;
