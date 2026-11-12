import { formatNaira } from "../../../Pages/cart/cartUtils";
import "./productPrice.css";

interface ProductPriceProps {
  price: number;
  oldPrice?: number;
}

function ProductPrice({ price, oldPrice }: ProductPriceProps) {
  // Price drop: only shown when the old price is really higher than the current one
  const was = oldPrice !== undefined && oldPrice > price ? oldPrice : undefined;
  const discount = was ? Math.round((1 - price / was) * 100) : 0;

  return (
    <div className="product-price">
      <span className="product-price__now">{formatNaira(price)}</span>
      {was !== undefined && discount >= 1 && (
        <span className="product-price__was">
          <span className="product-price__sr">Original price </span>
          <s className="product-price__old">{formatNaira(was)}</s>
          <span className="product-price__discount" aria-hidden="true">
            -{discount}%
          </span>
          <span className="product-price__sr">, {discount}% off</span>
        </span>
      )}
    </div>
  );
}

export default ProductPrice;
