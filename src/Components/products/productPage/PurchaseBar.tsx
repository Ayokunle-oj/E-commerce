import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Check, Minus, Plus, Trash2 } from "lucide-react";
import type { Product } from "../../../types/product";
import { useCart } from "../../../context/useCart";
import { formatNaira } from "../../../Pages/cart/cartUtils";
import "./purchaseBar.css";

type FocusTarget = "add" | "minus" | "plus" | null;

interface PurchaseBarProps {
  product: Product;
  // "sticky": pinned to the bottom on phones. "inline": sits in the details column from tablet up.
  placement: "inline" | "sticky";
}

// Add to cart, then a quantity control with an "Added" label, then "Go to cart".
// Same behaviour as the control on the product cards.
function PurchaseBar({ product, placement }: PurchaseBarProps) {
  const { items, addToCart, setQuantity, deleteItem } = useCart();
  const { id, name, price, stock } = product;
  const quantity = items.find((i) => i.id === id)?.quantity ?? 0;
  const soldOut = stock <= 0;

  const addRef = useRef<HTMLButtonElement>(null);
  const minusRef = useRef<HTMLButtonElement>(null);
  const plusRef = useRef<HTMLButtonElement>(null);
  const pendingFocus = useRef<FocusTarget>(null);

  // The pressed button disappears or becomes disabled, so keyboard focus moves to its replacement
  useEffect(() => {
    const target = pendingFocus.current;
    pendingFocus.current = null;
    if (target === "add") addRef.current?.focus();
    if (target === "minus") minusRef.current?.focus();
    if (target === "plus") plusRef.current?.focus();
  }, [quantity]);

  function handleAdd() {
    pendingFocus.current = stock > 1 ? "plus" : "minus";
    addToCart(product);
  }
  function handleIncrease() {
    if (quantity >= stock) return;
    pendingFocus.current = quantity + 1 >= stock ? "minus" : null;
    setQuantity(id, quantity + 1);
  }
  function handleDecrease() {
    if (quantity <= 1) {
      pendingFocus.current = "add";
      deleteItem(id);
    } else {
      setQuantity(id, quantity - 1);
    }
  }

  return (
    <div className={`purchase-bar purchase-bar--${placement}`}>
      <span className="purchase-bar__sr" aria-live="polite">
        {quantity > 0 ? `${name} added to cart, quantity ${quantity}` : ""}
      </span>

      {quantity === 0 ? (
        <>
          {placement === "sticky" && (
            <span className="purchase-bar__price">{formatNaira(price)}</span>
          )}
          <button
            type="button"
            ref={addRef}
            className="purchase-bar__add"
            disabled={soldOut}
            onClick={handleAdd}
          >
            {soldOut ? "Sold out" : "Add to cart"}
          </button>
        </>
      ) : (
        <>
          <div className="purchase-bar__quantity">
            <span className="purchase-bar__label">
              <Check size={12} aria-hidden="true" />
              Added
            </span>
            <div
              className="purchase-bar__stepper"
              role="group"
              aria-label={`Quantity of ${name} in your cart`}
            >
              <button
                type="button"
                ref={minusRef}
                className="purchase-bar__step"
                aria-label={quantity === 1 ? `Remove ${name} from cart` : "Decrease quantity"}
                onClick={handleDecrease}
              >
                {quantity === 1 ? (
                  <Trash2 size={18} aria-hidden="true" />
                ) : (
                  <Minus size={18} aria-hidden="true" />
                )}
              </button>
              <span className="purchase-bar__qty" aria-hidden="true">
                {quantity}
              </span>
              <button
                type="button"
                ref={plusRef}
                className="purchase-bar__step"
                aria-label="Increase quantity"
                title={quantity >= stock ? `Only ${stock} in stock` : undefined}
                disabled={quantity >= stock}
                onClick={handleIncrease}
              >
                <Plus size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
          <Link className="purchase-bar__cart" to="/cart">
            Go to cart
          </Link>
        </>
      )}
    </div>
  );
}

export default PurchaseBar;
