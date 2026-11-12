import { memo, useState } from "react";
import { Link } from "react-router-dom";
import { ImageOff, ShieldCheck } from "lucide-react";
import type { Product } from "../../../types/product";
import RatingStars from "../productCard/RatingStars";
import AddToCartControl from "../../cartItem/AddToCartControl";
import "./ProductCard.css";

interface ProductCardProps {
  product: Product;
  /** Not used any more: the card adds to the cart by itself. Kept so existing pages still compile. */
  onAddToCart?: (product: Product) => void;
}

const LOW_STOCK_LIMIT = 5;

const formatNaira = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;
const compact = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

// Quality bar colour, in steps of 20 points
function qualityTier(score: number) {
  if (score < 20) return "very-low";
  if (score < 40) return "low";
  if (score < 60) return "fair";
  if (score < 80) return "good";
  return "high";
}

function ProductCard({ product }: ProductCardProps) {
  const {
    id,
    name,
    description,
    price,
    oldPrice,
    stock,
    rating,
    sold,
    image,
    verified,
    quality,
  } = product;
  const [imageFailed, setImageFailed] = useState(false);

  const soldOut = stock <= 0;
  const lowStock = !soldOut && stock <= LOW_STOCK_LIMIT;

  // Price drop: only shown when the old price is really higher than the current one
  const originalPrice =
    oldPrice !== undefined && oldPrice > price ? oldPrice : undefined;
  const discount = originalPrice
    ? Math.round((1 - price / originalPrice) * 100)
    : 0;

  // Quality bar: only shown when there is an inspection score to back it up
  const score =
    quality === undefined
      ? undefined
      : Math.min(100, Math.max(0, Math.round(quality)));
  const tier = score === undefined ? "" : qualityTier(score);

  return (
    <article className="product-card">
      <div className="product-card__media">
        {image && !imageFailed ? (
          <img
            className="product-card__image"
            src={image}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <ImageOff
            className="product-card__placeholder"
            size={32}
            aria-hidden="true"
          />
        )}
        {verified && (
          <span
            className="product-card__verified"
            title="Checked by Fimba Go. What you see is what you get."
          >
            <ShieldCheck size={14} aria-hidden="true" />
            Verified
          </span>
        )}
        {soldOut && <span className="product-card__badge">Sold out</span>}
      </div>

      <div className="product-card__body">
        {/* The whole card is clickable through this link's ::after, so no button sits inside a link */}
        <Link className="product-card__name" to={`/product/${id}`} title={name}>
          {name}
        </Link>

        {description && <p className="product-card__desc">{description}</p>}

        <p className="product-card__meta">
          <span className="product-card__rating">
            <RatingStars rating={rating} />
            <span className="product-card__rating-value" aria-hidden="true">
              {rating > 0 ? rating.toFixed(1) : "No ratings"}
            </span>
          </span>
          <span className="product-card__sold">
            {compact.format(sold)} sold
          </span>
        </p>

        {score !== undefined && (
          <div
            className="product-card__quality"
            role="meter"
            aria-label="Quality score"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={score}
          >
            <span className="product-card__quality-label">Quality</span>
            <span className="product-card__quality-track">
              <span
                className={`product-card__quality-fill product-card__quality-fill--${tier}`}
                style={{ transform: `scaleX(${score / 100})` }}
              />
            </span>
            <span
              className={`product-card__quality-value product-card__quality-value--${tier}`}
            >
              {score}%
            </span>
          </div>
        )}

        {lowStock && <p className="product-card__stock">Only {stock} left</p>}

        <div className="product-card__footer">
          <div className="product-card__prices">
            <span className="product-card__price">{formatNaira(price)}</span>
            {originalPrice !== undefined && discount >= 1 && (
              <span className="product-card__was">
                <span className="product-card__sr">Original price </span>
                <s className="product-card__old-price">
                  {formatNaira(originalPrice)}
                </s>
                <span className="product-card__discount" aria-hidden="true">
                  -{discount}%
                </span>
                <span className="product-card__sr">, {discount}% off</span>
              </span>
            )}
          </div>
          <AddToCartControl product={product} />
        </div>
      </div>
    </article>
  );
}

// memo: the card itself only re-renders when its product changes.
// The cart control inside it listens to the cart on its own.
export default memo(ProductCard);
