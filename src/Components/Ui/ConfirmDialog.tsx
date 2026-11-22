import { useRef, type ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import ModalDialog from "./ModalDialog";
import { Button } from "./Button";
import "./confirmDialog.css";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  /** True while the action runs: both buttons lock and the dialog cannot be dismissed. */
  pending?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Ask before anything destructive. For "danger", focus starts on Cancel (the safe choice). */
function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  tone = "default",
  pending = false,
  error = null,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <ModalDialog
      open={open}
      onClose={onCancel}
      title={title}
      description={description}
      dismissible={!pending}
      initialFocusRef={tone === "danger" ? cancelRef : undefined}
    >
      {error && (
        <p className="confirm-dialog__error" role="alert">
          <CircleAlert size={16} aria-hidden="true" />
          {error}
        </p>
      )}
      <div className="confirm-dialog__actions">
        <Button ref={cancelRef} variant="ghost" onClick={onCancel} disabled={pending}>
          {cancelLabel}
        </Button>
        <Button
          variant={tone === "danger" ? "danger" : "primary"}
          loading={pending}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </ModalDialog>
  );
}

export default ConfirmDialog;
