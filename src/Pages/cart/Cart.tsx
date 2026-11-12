import { useCallback, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, ShoppingBag } from "lucide-react";
import { useCart } from "../../context/useCart";
import CartItem from "../../Components/cartItem/CartItem";
import CartSummary from "../../Components/cartItem/CartSummary";
import UndoToast from "../../Components/cartItem/UndoToast";
import {
  calcTotals,
  formatNaira,
  markHintDone,
  shouldPlayHint,
} from "./cartUtils";
import "./cart.css";

function Cart() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, wishlist, setQuantity, removeItem, moveToWishlist } =
    useCart();

  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [hintPending, setHintPending] = useState(shouldPlayHint);

  const totals = useMemo(
    () => calcTotals(items, promoCode),
    [items, promoCode],
  );
  const isEmpty = items.length === 0;

  const finishHint = useCallback(() => {
    markHintDone();
    setHintPending(false);
  }, []);

  const goBack = () => {
    if (location.key === "default") navigate("/");
    else navigate(-1);
  };
  const goToCheckout = () => navigate("/checkout"); // page comes later

  return (
    <div className="cart-page">
      <header className="cart-page__header">
        <button
          type="button"
          className="cart-page__back"
          aria-label="Go back"
          onClick={goBack}
        >
          <ArrowLeft size={20} aria-hidden="true" />
        </button>

        <div className="cart-page__heading">
          <h1 className="cart-page__title">My cart</h1>
          {!isEmpty && (
            <p className="cart-page__count">
              {totals.itemCount} {totals.itemCount === 1 ? "item" : "items"}
            </p>
          )}
        </div>

        <Link
          className="cart-page__wishlist"
          to="/wishlist"
          aria-label={
            wishlist.length > 0
              ? `Wishlist, ${wishlist.length} items`
              : "Wishlist"
          }
        >
          <Heart size={20} aria-hidden="true" />
          {wishlist.length > 0 && (
            <span className="cart-page__wishlist-count" aria-hidden="true">
              {wishlist.length}
            </span>
          )}
        </Link>
      </header>

      {isEmpty ? (
        <div className="cart-page__empty">
          <span className="cart-page__empty-icon">
            <ShoppingBag size={28} aria-hidden="true" />
          </span>
          <h2 className="cart-page__empty-title">Your cart is empty</h2>
          <p className="cart-page__empty-text">
            Items you add will show up here.
          </p>
          <Link className="cart-page__shop" to="/">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="cart-page__layout">
          <ul className="cart-page__list">
            {items.map((item, index) => (
              <CartItem
                key={item.id}
                item={item}
                playHint={hintPending && index === 0}
                onHintDone={finishHint}
                onQuantityChange={setQuantity}
                onRemove={removeItem}
                onWishlist={moveToWishlist}
              />
            ))}
          </ul>

          <aside className="cart-page__aside">
            <CartSummary
              totals={totals}
              promoCode={promoCode}
              onApplyPromo={setPromoCode}
              onRemovePromo={() => setPromoCode(null)}
              onCheckout={goToCheckout}
            />
          </aside>
        </div>
      )}

      {!isEmpty && (
        <div className="cart-page__bar">
          <button
            type="button"
            className="cart-page__checkout"
            onClick={goToCheckout}
          >
            Checkout for {formatNaira(totals.total)}
          </button>
        </div>
      )}

      <UndoToast />
    </div>
  );
}

export default Cart;
