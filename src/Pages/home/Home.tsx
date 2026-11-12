import SuggestedPicks from "../../Components/suggestion/SuggestedPicks";
import AdBoard from "../../Components/Adborad/AdBoard";
import ProductGrid from "../../Components/products/productGrid/ProductGrid";
function Home() {
  return (
    <>
      <AdBoard />
      <SuggestedPicks />
      <ProductGrid />
    </>
  );
}

export default Home;
