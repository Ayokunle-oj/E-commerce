import { Link } from "react-router-dom";
import { ArrowLeft, Heart, ShoppingBag } from "lucide-react";
import "./productTopBar.css";

interface ProductTopBarProps {
  wishlisted: boolean;
  cartCount: number;
  onBack: () => void;
  onToggleWishlist: () => void;
}

function ProductTopBar({
  wishlisted,
  cartCount,
  onBack,
  onToggleWishlist,
}: ProductTopBarProps) {
  return (
    <header className="product-top-bar">
      <button
        type="button"
        className="product-top-bar__button"
        aria-label="Go back"
        onClick={onBack}
      >
        <ArrowLeft size={20} aria-hidden="true" />
      </button>

      <div className="product-top-bar__actions">
        <button
          type="button"
          className={`product-top-bar__button${wishlisted ? " product-top-bar__button--on" : ""}`}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wishlisted}
          onClick={onToggleWishlist}
        >
          <Heart size={20} fill={wishlisted ? "currentColor" : "none"} aria-hidden="true" />
        </button>

        {/* The desktop navbar already has the cart */}
        <Link
          className="product-top-bar__button product-top-bar__cart"
          to="/cart"
          aria-label={cartCount > 0 ? `Cart, ${cartCount} items` : "Cart"}
        >
          <ShoppingBag size={20} aria-hidden="true" />
          {cartCount > 0 && (
            <span className="product-top-bar__badge" aria-hidden="true">
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}

export default ProductTopBar;
