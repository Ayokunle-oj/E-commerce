import { useEffect } from "react";
import { useCart } from "../../context/useCart";
import "./undoToast.css";

const VISIBLE_MS = 4000;

export default function UndoToast() {
  const { last, undo, dismissUndo } = useCart();
  const key = last?.key;

  useEffect(() => {
    if (key === undefined) return;
    const t = window.setTimeout(dismissUndo, VISIBLE_MS);
    return () => window.clearTimeout(t);
  }, [key, dismissUndo]);

  return (
    <div className="undo-toast-region" role="status" aria-live="polite">
      {last && (
        <div className="undo-toast" key={last.key}>
          <span className="undo-toast__message">
            {last.kind === "removed"
              ? "Removed from cart"
              : "Moved to wishlist"}
          </span>
          <button type="button" className="undo-toast__undo" onClick={undo}>
            Undo
          </button>
        </div>
      )}
    </div>
  );
}
