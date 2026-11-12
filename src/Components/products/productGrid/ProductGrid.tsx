import type { Product } from "../../../types/product";
import { products } from "../products";
import ProductCard from "../productCard/ProductCard";
import "./ProductGrid.css";

interface ProductGridProps {
  products?: Product[]; // empty by default: the grid only lays out what you give it
  onAddToCart?: (product: Product) => void;
  emptyMessage?: string;
}

function ProductGrid({
  // products = [],
  onAddToCart,
  emptyMessage = "No products to show yet.",
}: ProductGridProps) {
  if (products.length === 0) {
    return <p className="product-grid__empty">{emptyMessage}</p>;
  }

  return (
    <ul className="product-grid" role="list">
      {products.map((product) => (
        <li key={product.id} className="product-grid__item">
          <ProductCard product={product} onAddToCart={onAddToCart} />
        </li>
      ))}
    </ul>
  );
}

export default ProductGrid;
