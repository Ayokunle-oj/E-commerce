import { useMemo } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useCart } from "../../../context/useCart";
import { products } from "../products";
import { getExtras } from "../../../data/productExtras";
import ProductTopBar from "./ProductTopBar";
import ProductGallery from "./ProductGallery";
import ProductPrice from "./ProductPrice";
import ProductSummary from "./ProductSummary";
import DeliveryInfo from "./DeliveryInfo";
import PurchaseBar from "./PurchaseBar";
import ProductDescription from "./ProductDescription";
import ProductSpecs from "./ProductSpecs";
import InspectionDetails from "./InspectionDetails";
import SimilarItems from "./SimilarItems";
import "./productPage.css";

const SIMILAR_LIMIT = 8;

function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { items, wishlist, itemCount, toggleWishlist } = useCart();

  const product = useMemo(() => products.find((p) => p.id === id), [id]);

  // Same category first. If there is nothing in the category, fall back to best sellers
  // under a different heading. Items already in the cart are left out.
  const related = useMemo(() => {
    if (!product) return { title: "", list: [], seeAllTo: undefined };
    const inCart = new Set(items.map((i) => i.id));
    const others = products.filter(
      (p) => p.id !== product.id && !inCart.has(p.id),
    );
    const sameCategory = product.category
      ? others.filter((p) => p.category === product.category)
      : [];
    if (sameCategory.length > 0) {
      return {
        title: "Similar items",
        list: [...sameCategory]
          .sort((a, b) => b.sold - a.sold)
          .slice(0, SIMILAR_LIMIT),
        seeAllTo: `/categories?cat=${encodeURIComponent(product.category!)}`,
      };
    }
    return {
      title: "You may also like",
      list: [...others].sort((a, b) => b.sold - a.sold).slice(0, SIMILAR_LIMIT),
      seeAllTo: "/categories?list=best-sellers",
    };
  }, [product, items]);

  if (!product) {
    return (
      <div className="product-page product-page--missing">
        <h1 className="product-page__missing-title">Product not found</h1>
        <p className="product-page__missing-text">
          This product may have been removed, or the link is wrong.
        </p>
        <Link className="product-page__missing-link" to="/">
          Back to home
        </Link>
      </div>
    );
  }

  const extras = getExtras(product);
  const images = extras.images?.length ? extras.images : [product.image];
  const description = extras.longDescription ?? product.description;
  const wishlisted = wishlist.some((w) => w.id === product.id);

  const goBack = () => {
    if (location.key === "default") navigate("/");
    else navigate(-1);
  };

  return (
    <div className="product-page">
      <ProductTopBar
        wishlisted={wishlisted}
        cartCount={itemCount}
        onBack={goBack}
        onToggleWishlist={() => toggleWishlist(product)}
      />

      <div className="product-page__top">
        <div className="product-page__gallery">
          <ProductGallery images={images} name={product.name} />
        </div>

        <div className="product-page__info">
          <ProductPrice price={product.price} oldPrice={product.oldPrice} />
          <ProductSummary
            name={product.name}
            rating={product.rating}
            sold={product.sold}
            verified={product.verified}
            stock={product.stock}
          />
          <DeliveryInfo delivery={extras.delivery} />
          <PurchaseBar product={product} placement="inline" />
        </div>
      </div>

      <div className="product-page__sections">
        {description && <ProductDescription text={description} />}
        {extras.details && <ProductSpecs details={extras.details} />}
        {product.verified && extras.inspection && (
          <InspectionDetails
            quality={product.quality}
            inspection={extras.inspection}
          />
        )}
        <SimilarItems
          key={related.title}
          products={related.list}
          title={related.title}
          seeAllTo={related.seeAllTo}
        />
      </div>

      <PurchaseBar product={product} placement="sticky" />
    </div>
  );
}

export default ProductPage;
