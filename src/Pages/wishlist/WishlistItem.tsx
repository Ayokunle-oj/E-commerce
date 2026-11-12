import { Link } from "react-router-dom";
import { ShieldCheck, Trash2 } from "lucide-react";
import type { Product } from "../../types/product";
import { formatNaira } from "../../Pages/cart/cartUtils";
import ProductThumb from "../../Components/cartItem/ProductThumb";
import "./wishlistItem.css";

interface WishlistItemProps {
  product: Product;
  onMoveToCart: (id: string) => void;
  onRemove: (id: string) => void;
}

function WishlistItem({ product, onMoveToCart, onRemove }: WishlistItemProps) {
  const { id, name, price, oldPrice, stock, verified, image } = product;
  const soldOut = stock <= 0;
  const wasPrice =
    oldPrice !== undefined && oldPrice > price ? oldPrice : undefined;

  return (
    <li className="wishlist-item">
      <Link
        className="wishlist-item__thumb"
        to={`/product/${id}`}
        tabIndex={-1}
        aria-hidden="true"
      >
        <ProductThumb image={image} />
      </Link>

      <div className="wishlist-item__info">
        <h3 className="wishlist-item__heading">
          <Link className="wishlist-item__name" to={`/product/${id}`}>
            {name}
          </Link>
        </h3>
        {verified && (
          <p className="wishlist-item__verified">
            <ShieldCheck size={13} aria-hidden="true" />
            Verified
          </p>
        )}
        <div className="wishlist-item__prices">
          <span className="wishlist-item__price">{formatNaira(price)}</span>
          {wasPrice !== undefined && (
            <s className="wishlist-item__old-price">{formatNaira(wasPrice)}</s>
          )}
        </div>
      </div>

      <div className="wishlist-item__actions">
        <button
          type="button"
          className="wishlist-item__move"
          disabled={soldOut}
          onClick={() => onMoveToCart(id)}
        >
          {soldOut ? "Sold out" : "Move to cart"}
        </button>
        <button
          type="button"
          className="wishlist-item__remove"
          aria-label={`Remove ${name} from wishlist`}
          onClick={() => onRemove(id)}
        >
          <Trash2 size={18} aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}

export default WishlistItem;
