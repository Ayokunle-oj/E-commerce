import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type TransitionEvent,
} from "react";
import { Link } from "react-router-dom";
import { Heart, Minus, Plus, ShieldCheck, Trash2, X } from "lucide-react";
import type { CartLine } from "../../types/cart";
import { formatNaira } from "../../Pages/cart/cartUtils";
import ProductThumb from "../cartItem/ProductThumb";
import "./cartItem.css";

const COMMIT_RATIO = 0.4; // swipe past 40% of the row to confirm
const DRAG_DEADZONE = 8; // px of movement before a touch counts as a swipe
const EDGE_GUARD = 24; // touches this close to the screen edge are left to the browser
const COMMIT_DELAY = 180; // ms, lets the row finish sliding out
const LOW_STOCK_LIMIT = 5;
const PHONE_WIDTH = "(max-width: 767px)";

interface CartItemProps {
  item: CartLine;
  playHint?: boolean;
  onHintDone?: () => void;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onWishlist: (id: string) => void;
}

function CartItem({
  item,
  playHint = false,
  onHintDone,
  onQuantityChange,
  onRemove,
  onWishlist,
}: CartItemProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number | null>(null);
  const liveOffset = useRef(0);
  const locked = useRef(false);
  const commitTimer = useRef<number | undefined>(undefined);

  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [armed, setArmed] = useState(false);
  // The coloured panels only exist while the row is away from rest.
  // Keeping them mounted at rest let their edges show through the card border.
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!playHint) return;
    const nudge = (value: number) => {
      liveOffset.current = value;
      setOffset(value);
      if (value !== 0) setRevealed(true);
    };
    const timers = [
      window.setTimeout(() => nudge(56), 500),
      window.setTimeout(() => nudge(-56), 1100),
      window.setTimeout(() => nudge(0), 1700),
      window.setTimeout(() => onHintDone?.(), 2100),
    ];
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      liveOffset.current = 0;
      setOffset(0);
    };
  }, [playHint, onHintDone]);

  useEffect(() => () => window.clearTimeout(commitTimer.current), []);

  function moveTo(value: number) {
    liveOffset.current = value;
    setOffset(value);
    if (value !== 0) setRevealed(true);
  }

  function reset() {
    startX.current = null;
    setDragging(false);
    setArmed(false);
    if (liveOffset.current === 0) setRevealed(false);
    moveTo(0);
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (locked.current || e.button !== 0) return;
    if (e.pointerType === "mouse") {
      // A mouse can swipe too, but only in the phone layout (handy for testing in a narrow window)
      if (!window.matchMedia(PHONE_WIDTH).matches) return;
    } else if (
      e.clientX < EDGE_GUARD ||
      e.clientX > window.innerWidth - EDGE_GUARD
    ) {
      return;
    }
    if (playHint) onHintDone?.();
    startX.current = e.clientX;
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const el = bodyRef.current;
    if (startX.current === null || !el || locked.current) return;

    const dx = e.clientX - startX.current;
    if (!dragging) {
      if (Math.abs(dx) < DRAG_DEADZONE) return;
      el.setPointerCapture(e.pointerId);
      setDragging(true);
    }
    const width = el.offsetWidth;
    moveTo(Math.max(-width, Math.min(width, dx)));
    setArmed(Math.abs(dx) >= width * COMMIT_RATIO);
  }

  function handlePointerUp() {
    const wasDragging = dragging;
    startX.current = null;
    if (!wasDragging) return;

    const width = bodyRef.current?.offsetWidth ?? 0;
    const current = liveOffset.current;
    setDragging(false);

    if (width > 0 && Math.abs(current) >= width * COMMIT_RATIO) {
      locked.current = true;
      const goingLeft = current < 0;
      moveTo(goingLeft ? -width : width);
      commitTimer.current = window.setTimeout(() => {
        if (goingLeft) onRemove(item.id);
        else onWishlist(item.id);
      }, COMMIT_DELAY);
    } else {
      setArmed(false);
      moveTo(0);
    }
  }

  function handleTransitionEnd(e: TransitionEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget || e.propertyName !== "transform") return;
    if (liveOffset.current === 0) setRevealed(false);
  }

  const armedSide = armed ? (offset > 0 ? "wishlist" : "delete") : null;
  const lowStock = item.stock <= LOW_STOCK_LIMIT;
  const oldPrice =
    item.oldPrice !== undefined && item.oldPrice > item.price
      ? item.oldPrice
      : undefined;

  return (
    <li className="cart-item">
      {revealed && (
        <div className="cart-item__actions" aria-hidden="true">
          <div
            className={`cart-item__panel cart-item__panel--wishlist${
              armedSide === "wishlist" ? " cart-item__panel--armed" : ""
            }`}
          >
            <Heart size={20} />
            <span>Wishlist</span>
          </div>
          <div
            className={`cart-item__panel cart-item__panel--delete${
              armedSide === "delete" ? " cart-item__panel--armed" : ""
            }`}
          >
            <span>Delete</span>
            <Trash2 size={20} />
          </div>
        </div>
      )}

      <div
        ref={bodyRef}
        className={`cart-item__body${dragging ? " cart-item__body--dragging" : ""}`}
        style={{
          transform: `translateX(${offset}px)`,
          transitionDuration: playHint ? "320ms" : undefined,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={reset}
        onTransitionEnd={handleTransitionEnd}
      >
        <Link
          className="cart-item__thumb"
          to={`/product/${item.id}`}
          tabIndex={-1}
          aria-hidden="true"
          draggable={false}
        >
          <ProductThumb image={item.image} />
        </Link>

        <div className="cart-item__info">
          <div className="cart-item__top">
            <h3 className="cart-item__heading">
              <Link
                className="cart-item__name"
                to={`/product/${item.id}`}
                draggable={false}
              >
                {item.name}
              </Link>
            </h3>
            <button
              type="button"
              className="cart-item__remove"
              aria-label={`Remove ${item.name} from cart`}
              onClick={() => onRemove(item.id)}
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          {(item.verified || lowStock) && (
            <p className="cart-item__meta">
              {item.verified && (
                <span className="cart-item__verified">
                  <ShieldCheck size={13} aria-hidden="true" />
                  Verified
                </span>
              )}
              {lowStock && (
                <span className="cart-item__stock">Only {item.stock} left</span>
              )}
            </p>
          )}

          <button
            type="button"
            className="cart-item__wishlist"
            onClick={() => onWishlist(item.id)}
          >
            <Heart size={14} aria-hidden="true" />
            Move to wishlist
          </button>

          <div className="cart-item__bottom">
            <div className="cart-item__prices">
              <span className="cart-item__price">
                {formatNaira(item.price)}
              </span>
              {oldPrice !== undefined && (
                <s className="cart-item__old-price">{formatNaira(oldPrice)}</s>
              )}
            </div>

            <div
              className="cart-item__stepper"
              role="group"
              aria-label={`Quantity for ${item.name}`}
            >
              <button
                type="button"
                className="cart-item__step"
                aria-label="Decrease quantity"
                disabled={item.quantity <= 1}
                onClick={() => onQuantityChange(item.id, item.quantity - 1)}
              >
                <Minus size={16} aria-hidden="true" />
              </button>
              <span className="cart-item__qty" aria-live="polite">
                {item.quantity}
              </span>
              <button
                type="button"
                className="cart-item__step"
                aria-label="Increase quantity"
                disabled={item.quantity >= item.stock}
                onClick={() => onQuantityChange(item.id, item.quantity + 1)}
              >
                <Plus size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

export default CartItem;
