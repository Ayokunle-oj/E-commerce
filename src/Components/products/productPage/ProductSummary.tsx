import { ShieldCheck } from "lucide-react";
import RatingStars from "../../products/productCard/RatingStars";
import "./productSummary.css";

interface ProductSummaryProps {
  name: string;
  rating: number;
  sold: number;
  verified?: boolean;
  stock: number;
}

const LOW_STOCK_LIMIT = 5;
const compact = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function ProductSummary({
  name,
  rating,
  sold,
  verified,
  stock,
}: ProductSummaryProps) {
  const soldOut = stock <= 0;
  const lowStock = !soldOut && stock <= LOW_STOCK_LIMIT;

  return (
    <div className="product-summary">
      <h1 className="product-summary__name">{name}</h1>

      <p className="product-summary__meta">
        <span className="product-summary__rating">
          <RatingStars rating={rating} size={14} />
          <span className="product-summary__rating-value" aria-hidden="true">
            {rating > 0 ? rating.toFixed(1) : "No ratings"}
          </span>
        </span>
        <span className="product-summary__sold">
          {compact.format(sold)} sold
        </span>
      </p>

      {(verified || soldOut || lowStock) && (
        <p className="product-summary__tags">
          {verified && (
            <span className="product-summary__verified">
              <ShieldCheck size={14} aria-hidden="true" />
              Verified by Fimba Go
            </span>
          )}
          {soldOut && (
            <span className="product-summary__sold-out">Sold out</span>
          )}
          {lowStock && (
            <span className="product-summary__stock">Only {stock} left</span>
          )}
        </p>
      )}
    </div>
  );
}

export default ProductSummary;
