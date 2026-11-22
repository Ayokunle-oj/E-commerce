import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import { X } from "lucide-react";
import "./modalDialog.css";

interface ModalDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  /** When false, Esc, the backdrop and the close button are all disabled (e.g. while saving). */
  dismissible?: boolean;
  /** On phones, fill the whole screen. Use for forms. Other dialogs become a bottom sheet. */
  fullOnMobile?: boolean;
  /** Element to focus first. Defaults to the first focusable element in the dialog. */
  initialFocusRef?: RefObject<HTMLElement | null>;
}

/**
 * Built on the native <dialog> element, so the browser provides the focus trap, Esc to close,
 * inert background and focus return to the opener. Children are only mounted while open,
 * so a form inside always starts fresh.
 */
function ModalDialog({
  open,
  onClose,
  title,
  description,
  children,
  dismissible = true,
  fullOnMobile = false,
  initialFocusRef,
}: ModalDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pressStartedOnBackdrop = useRef(false);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      initialFocusRef?.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, initialFocusRef]);

  return (
    <dialog
      ref={dialogRef}
      className={`modal${fullOnMobile ? " modal--full-mobile" : ""}`}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        // Esc. Block it while a request is running.
        if (!dismissible) event.preventDefault();
      }}
      onClose={() => {
        // Fires for every close, including the one our own effect triggers. Only report
        // closes the parent does not already know about.
        if (open) onClose();
      }}
      onMouseDown={(event) => {
        pressStartedOnBackdrop.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        // Close only if the press began AND ended on the backdrop, so dragging to select text
        // inside the dialog and releasing outside does not dismiss it.
        if (
          dismissible &&
          pressStartedOnBackdrop.current &&
          event.target === event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      {open && (
        <div className="modal__panel">
          <header className="modal__header">
            <h2 id={titleId} className="modal__title">
              {title}
            </h2>
            {dismissible && (
              <button
                type="button"
                className="modal__close"
                aria-label="Close"
                onClick={onClose}
              >
                <X size={20} aria-hidden="true" />
              </button>
            )}
          </header>
          {description && (
            <div id={descriptionId} className="modal__description">
              {description}
            </div>
          )}
          <div className="modal__body">{children}</div>
        </div>
      )}
    </dialog>
  );
}

export default ModalDialog;
