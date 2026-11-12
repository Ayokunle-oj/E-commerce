import { useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { SearchBar } from "../../Components/search/SearchBar";
import FilterButton from "../categories/sub_categories/FilterButton";
import CategoryChips from "../categories/sub_categories/CategoryChips";
import ProductSection from "../categories/sub_categories/ProductSection";
import AdBoard from "../../Components/Adborad/AdBoard";
import { categoryAds } from "../../types/ads";
import { products } from "../../Components/products/products";
import type { Product } from "../../types/product";
import { useCart } from "../../context/useCart";
import "./categories.css";

interface CuratedList {
  key: string; // used in the address: /categories?list=verified
  title: string;
  subtitle: string;
  tone: "green" | "gold" | "dark" | "red";
  products: Product[];
}

function Categories() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { addToCart } = useCart();

  // Only categories that really have products, so a chip never leads to an empty page
  const categoryList = useMemo(
    () =>
      Array.from(
        new Set(products.flatMap((p) => (p.category ? [p.category] : []))),
      ).sort(),
    [],
  );

  // Ready-made lists. Each one is just a filtered list handed to a ProductSection.
  const lists = useMemo<CuratedList[]>(
    () => [
      {
        key: "verified",
        title: "Verified favourites",
        subtitle: "Checked by us, with top quality scores",
        tone: "green",
        products: products
          .filter((p) => p.verified && (p.quality ?? 0) >= 85)
          .sort((a, b) => (b.quality ?? 0) - (a.quality ?? 0)),
      },
      {
        key: "best-sellers",
        title: "Best sellers",
        subtitle: "What students buy most",
        tone: "gold",
        products: [...products].sort((a, b) => b.sold - a.sold),
      },
      {
        key: "under-10k",
        title: "Under ₦10,000",
        subtitle: "Easy on the pocket",
        tone: "dark",
        products: products
          .filter((p) => p.price < 10000 && p.stock > 0)
          .sort((a, b) => a.price - b.price),
      },
      {
        key: "price-drops",
        title: "Price drops",
        subtitle: "Cheaper than before",
        tone: "red",
        products: products.filter(
          (p) => p.oldPrice !== undefined && p.oldPrice > p.price,
        ),
      },
    ],
    [],
  );

  // What the page shows lives in the address: ?cat=Bags or ?list=verified.
  // The back button, refresh and shared links all keep working.
  const requestedCat = params.get("cat");
  const activeCategory =
    requestedCat && categoryList.includes(requestedCat) ? requestedCat : null;
  const activeList = activeCategory
    ? null
    : (lists.find((l) => l.key === params.get("list")) ?? null);

  const inCategory = useMemo(
    () =>
      activeCategory
        ? products.filter((p) => p.category === activeCategory)
        : [],
    [activeCategory],
  );

  function selectCategory(category: string | null) {
    setParams(category ? { cat: category } : {});
  }

  const count = (n: number) => `${n} ${n === 1 ? "product" : "products"}`;

  return (
    <div className="categories_container">
      <header className="categories_top">
        <h1 className="categories_title">Categories</h1>

        <div className="categories_search">
          <SearchBar
            placeholder="Search products"
            onSearch={(term) =>
              navigate(`/search?q=${encodeURIComponent(term)}`)
            }
          />
        </div>

        <div className="categories_filter">
          <FilterButton
            onClick={() => {
              // TODO: open the filter sheet (the next building block)
            }}
          />
        </div>

        <div className="categories_chips">
          <CategoryChips
            categories={categoryList}
            selected={activeCategory}
            onSelect={selectCategory}
          />
        </div>
      </header>

      <div className="categories_sections">
        {activeCategory ? (
          <ProductSection
            tone="green"
            title={activeCategory}
            subtitle={count(inCategory.length)}
            products={inCategory}
            onAddToCart={addToCart}
          />
        ) : activeList ? (
          <>
            <Link className="categories_back" to="/categories">
              <ArrowLeft size={16} aria-hidden="true" />
              All categories
            </Link>
            <ProductSection
              tone={activeList.tone}
              title={activeList.title}
              subtitle={`${activeList.subtitle} · ${count(activeList.products.length)}`}
              products={activeList.products}
              onAddToCart={addToCart}
            />
          </>
        ) : (
          <>
            <AdBoard ads={categoryAds} label="Offers on Categories" />
            {lists.map((list) => (
              <ProductSection
                key={list.key}
                tone={list.tone}
                title={list.title}
                subtitle={list.subtitle}
                products={list.products}
                layout="row"
                limit={8}
                seeAllTo={`/categories?list=${list.key}`}
                onAddToCart={addToCart}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default Categories;
