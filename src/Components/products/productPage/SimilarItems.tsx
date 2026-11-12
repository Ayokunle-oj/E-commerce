import { Link } from "react-router-dom";
import type { Product } from "../../../types/product";
import ProductCard from "../productCard/ProductCard";
import "./similarItems.css";

interface SimilarItemsProps {
  title?: string;
  products: Product[];
  seeAllTo?: string;
}

function SimilarItems({
  title = "Similar items",
  products,
  seeAllTo,
}: SimilarItemsProps) {
  if (products.length === 0) return null;

  return (
    <section className="similar-items" aria-labelledby="similar-title">
      <div className="similar-items__head">
        <h2 className="similar-items__title" id="similar-title">
          {title}
        </h2>
        {seeAllTo && (
          <Link className="similar-items__all" to={seeAllTo}>
            See all
          </Link>
        )}
      </div>
      <ul className="similar-items__row">
        {products.map((product) => (
          <li className="similar-items__item" key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export default SimilarItems;
