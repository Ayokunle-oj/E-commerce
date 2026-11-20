import SuggestedPicks from "../../Components/suggestion/SuggestedPicks";
import AdBoard from "../../Components/Adborad/AdBoard";
import ProductGrid from "../../Components/products/productGrid/ProductGrid";
import { products } from "../../Components/products/products";
function Home() {
  return (
    <>
      <AdBoard />
      <SuggestedPicks />
      <ProductGrid products={products} />
    </>
  );
}

export default Home;
