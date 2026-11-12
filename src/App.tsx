import { lazy, Suspense, useEffect, useRef } from "react";
import {
  Route,
  Routes,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import Navbar from "./Components/navbar/Navbar";
import BottomNav from "./Components/navbar/BottomNavbar/BottomNav";
import MobileNav from "./Components/navbar/mobileNav/MobileNav";
import Footer from "./Components/footer/Footer";
import Home from "./Pages/home/Home";
import Cart from "./Pages/cart/Cart";
import Wishlist from "./Pages/wishlist/Wishlist";
import Categories from "./Pages/categories/Categories";
import { useCart } from "./context/useCart";
import "./App.css";

// The product page loads only when someone opens a product
const ProductPage = lazy(
  () => import("./Components/products/productPage/ProductPage"),
);

// Demo user until sign-in exists. Every nav reads the same one so they always agree.
const demoUser = { name: "David" };

// Pages you have not built yet. Swap each one for the real page when it is ready.
function Placeholder({ title }: { title: string }) {
  return (
    <div className="app_placeholder">
      <h1>{title}</h1>
      <p>This page is coming soon.</p>
    </div>
  );
}

// Every new page opens at the top. Changing only ?cat= or ?q= does not scroll,
// and going back (the browser back button) leaves the scroll position to the browser.
function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  const latestType = useRef(navigationType);
  useEffect(() => {
    latestType.current = navigationType;
  });
  useEffect(() => {
    if (latestType.current !== "POP") window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  const { pathname } = useLocation();
  const { itemCount, subtotal } = useCart();

  return (
    <>
      <ScrollToTop />
      <Navbar
        user={demoUser}
        notificationCount={3}
        cartCount={itemCount}
        cartTotal={subtotal}
      />

      {/* The phone greeting + search belongs to Home. Other pages bring their own top section. */}
      {pathname === "/" && <MobileNav user={demoUser} />}

      <main className="app_main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route
            path="/product/:id"
            element={
              <Suspense
                fallback={
                  <div className="app_placeholder" role="status">
                    <p>Loading...</p>
                  </div>
                }
              >
                <ProductPage />
              </Suspense>
            }
          />
          <Route path="/checkout" element={<Placeholder title="Checkout" />} />
          <Route path="/account" element={<Placeholder title="Account" />} />
          <Route
            path="/search"
            element={<Placeholder title="Search results" />}
          />
          <Route path="*" element={<Placeholder title="Page not found" />} />
        </Routes>
      </main>

      <div className="app_footer">
        <Footer />
      </div>
      {/* The product page has its own purchase bar in that spot */}
      {!pathname.startsWith("/product/") && (
        <BottomNav
          user={demoUser}
          cartCount={itemCount}
          notificationCount={3}
        />
      )}
    </>
  );
}

export default App;
