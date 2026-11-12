import { useId } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { Product } from "../../../types/product";
import ProductCard from "../../../Components/products/productCard/ProductCard";
import ProductGrid from "../../../Components/products/productGrid/ProductGrid";
import "./ProductSection.css";

// A reusable block: a title, an optional "See all" link, and a list of product cards.
// Give it any list of products and it draws the section. Use it as many times as you like.
interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  layout?: "grid" | "row"; // grid wraps into columns, row is one line you scroll sideways
  limit?: number; // show only the first N products
  seeAllTo?: string; // where "See all" goes. Leave out to hide the link
  onAddToCart?: (product: Product) => void;
  emptyMessage?: string; // shown when the list is empty. Without it, an empty section hides itself
  tone?: "plain" | "green" | "gold" | "dark" | "red"; // plain = no colour. The others draw a coloured panel
}

function ProductSection({
  title,
  subtitle,
  products,
  layout = "grid",
  limit,
  seeAllTo,
  onAddToCart,
  emptyMessage,
  tone = "plain",
}: ProductSectionProps) {
  const headingId = useId();

  if (products.length === 0 && !emptyMessage) return null;

  const shown = limit ? products.slice(0, limit) : products;

  return (
    <section
      className={`product-section${tone === "plain" ? "" : ` product-section--panel product-section--${tone}`}`}
      aria-labelledby={headingId}
    >
      <header className="product-section__header">
        <div className="product-section__titles">
          <h2 className="product-section__title" id={headingId}>
            {title}
          </h2>
          {subtitle && <p className="product-section__subtitle">{subtitle}</p>}
        </div>
        {seeAllTo && (
          <Link className="product-section__see-all" to={seeAllTo}>
            See all
            <ChevronRight size={16} aria-hidden="true" />
          </Link>
        )}
      </header>

      {shown.length === 0 ? (
        <p className="product-section__empty">{emptyMessage}</p>
      ) : layout === "row" ? (
        <ul className="product-section__row" role="list">
          {shown.map((product) => (
            <li key={product.id} className="product-section__row-item">
              <ProductCard product={product} onAddToCart={onAddToCart} />
            </li>
          ))}
        </ul>
      ) : (
        <ProductGrid products={shown} onAddToCart={onAddToCart} />
      )}
    </section>
  );
}

export default ProductSection;
