import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, ShoppingBag } from "lucide-react";
import { useCart } from "../../context/useCart";
import WishlistItem from "./WishlistItem";
import "./wishlist.css";

function Wishlist() {
  const navigate = useNavigate();
  const location = useLocation();
  const { wishlist, itemCount, moveToCart, removeFromWishlist } = useCart();

  const goBack = () => {
    if (location.key === "default") navigate("/");
    else navigate(-1);
  };

  return (
    <div className="wishlist-page">
      <header className="wishlist-page__header">
        <button
          type="button"
          className="wishlist-page__back"
          aria-label="Go back"
          onClick={goBack}
        >
          <ArrowLeft size={20} aria-hidden="true" />
        </button>

        <div className="wishlist-page__heading">
          <h1 className="wishlist-page__title">Wishlist</h1>
          {wishlist.length > 0 && (
            <p className="wishlist-page__count">
              {wishlist.length} {wishlist.length === 1 ? "item" : "items"}
            </p>
          )}
        </div>

        <Link
          className="wishlist-page__cart"
          to="/cart"
          aria-label={itemCount > 0 ? `Cart, ${itemCount} items` : "Cart"}
        >
          <ShoppingBag size={20} aria-hidden="true" />
          {itemCount > 0 && (
            <span className="wishlist-page__cart-count" aria-hidden="true">
              {itemCount > 99 ? "99+" : itemCount}
            </span>
          )}
        </Link>
      </header>

      {wishlist.length === 0 ? (
        <div className="wishlist-page__empty">
          <span className="wishlist-page__empty-icon">
            <Heart size={28} aria-hidden="true" />
          </span>
          <h2 className="wishlist-page__empty-title">Your wishlist is empty</h2>
          <p className="wishlist-page__empty-text">
            Swipe an item in your cart to the right to save it here.
          </p>
          <Link className="wishlist-page__shop" to="/">
            Browse products
          </Link>
        </div>
      ) : (
        <ul className="wishlist-page__list">
          {wishlist.map((product) => (
            <WishlistItem
              key={product.id}
              product={product}
              onMoveToCart={moveToCart}
              onRemove={removeFromWishlist}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

export default Wishlist;
