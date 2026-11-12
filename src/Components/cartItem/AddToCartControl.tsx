import { useEffect, useRef } from "react";
import { Check, Minus, Plus, Trash2 } from "lucide-react";
import type { Product } from "../../types/product";
import { useCart } from "../../context/useCart";
import "./addToCartControl.css";

type FocusTarget = "add" | "minus" | "plus" | null;

interface AddToCartControlProps {
  product: Product;
}

// "To cart" until the product is in the cart, then a quantity control with an "Added" label.
// It reads the cart itself, so the card never has to know about it.
function AddToCartControl({ product }: AddToCartControlProps) {
  const { items, addToCart, setQuantity, deleteItem } = useCart();
  const quantity = items.find((i) => i.id === product.id)?.quantity ?? 0;
  const { id, name, stock } = product;

  const addRef = useRef<HTMLButtonElement>(null);
  const minusRef = useRef<HTMLButtonElement>(null);
  const plusRef = useRef<HTMLButtonElement>(null);
  const pendingFocus = useRef<FocusTarget>(null);

  // The button the person just pressed disappears or becomes disabled,
  // so hand keyboard focus to the control that replaces it.
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
    <div className="add-to-cart">
      <span className="add-to-cart__sr" aria-live="polite">
        {quantity > 0 ? `${name} added to cart, quantity ${quantity}` : ""}
      </span>

      {quantity === 0 ? (
        stock <= 0 ? (
          <button type="button" className="add-to-cart__button" disabled>
            Sold out
          </button>
        ) : (
          <button
            type="button"
            ref={addRef}
            className="add-to-cart__button"
            onClick={handleAdd}
          >
            To cart
          </button>
        )
      ) : (
        <>
          <span className="add-to-cart__label">
            <Check size={12} aria-hidden="true" />
            Added
          </span>
          <div
            className="add-to-cart__stepper"
            role="group"
            aria-label={`Quantity of ${name} in your cart`}
          >
            <button
              type="button"
              ref={minusRef}
              className="add-to-cart__step"
              aria-label={
                quantity === 1
                  ? `Remove ${name} from cart`
                  : "Decrease quantity"
              }
              onClick={handleDecrease}
            >
              {quantity === 1 ? (
                <Trash2 size={16} aria-hidden="true" />
              ) : (
                <Minus size={16} aria-hidden="true" />
              )}
            </button>
            <span className="add-to-cart__qty" aria-hidden="true">
              {quantity}
            </span>
            <button
              type="button"
              ref={plusRef}
              className="add-to-cart__step"
              aria-label="Increase quantity"
              title={quantity >= stock ? `Only ${stock} in stock` : undefined}
              disabled={quantity >= stock}
              onClick={handleIncrease}
            >
              <Plus size={16} aria-hidden="true" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default AddToCartControl;
