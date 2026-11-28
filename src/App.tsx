import { Suspense, useEffect, useRef } from "react";
import {
  Link,
  Route,
  Routes,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import Navbar from "./Components/navbar/Navbar";
import BottomNav from "./Components/navbar/BottomNavbar/BottomNav";
import MobileNav from "./Components/navbar/mobileNav/MobileNav";
import Footer from "./Components/footer/Footer";
import ErrorBoundary from "./Components/errorBoundary/ErrorBoundary";
import { lazyWithRetry } from "./Components/errorBoundary/lazyWithRetry";
import Home from "./Pages/home/Home";
import Cart from "./Pages/cart/Cart";
import Wishlist from "./Pages/wishlist/Wishlist";
import Categories from "./Pages/categories/Categories";
import NotFound from "./Components/errorBoundary/NotFound";
import { AccountProvider } from "./Pages/profile/AccountProvider";
import Login from "./Pages/login/Login";
import Signup from "./Pages/login/Signup";
import RequireAuth from "./Components/auth/RequireAuth";
import { useAuth } from "./auth/authContext";
import { useCart } from "./context/useCart";
import { Heart, ShoppingBag, UserRound } from "lucide-react";
import "./App.css";

// The product page loads only when someone opens a product.
// If the file fails to load, the page reloads once before showing the error screen.
const ProductPage = lazyWithRetry(
  () => import("./Components/products/productPage/ProductPage"),
);

// The account area loads only when someone opens /account
const AccountRoutes = lazyWithRetry(
  () => import("./Pages/profile/AccountRoutes"),
);

// Pages you have not built yet. Swap each one for the real page when it is ready.
function Placeholder({ title }: { title: string }) {
  return (
    <div className="app_placeholder">
      <h1>{title}</h1>
      <p>This page is coming soon.</p>
      <Link to="/">Back to home</Link>
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
  const { user } = useAuth();
  const navUser = user
    ? { name: user.fullName, avatarUrl: user.avatarUrl ?? undefined }
    : null;
  // The login and sign-up pages are full screens with their own header
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  return (
    <>
      <ScrollToTop />
      {/* Guests get the "Sign in" state in all three navs. Signed in: their name and avatar. */}
      {!isAuthPage && (
        <Navbar user={navUser} cartCount={itemCount} cartTotal={subtotal} />
      )}

      {/* The phone greeting + search belongs to Home. Other pages bring their own top section. */}
      {pathname === "/" && <MobileNav user={navUser} />}

      <main className="app_main">
        <AccountProvider key={user?.id ?? "guest"}>
          {/* A crash in a page shows the retry screen here, and the navbars stay usable.
              Moving to another page clears the error. */}
          <ErrorBoundary resetKey={pathname}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/categories" element={<Categories />} />
              <Route
                path="/cart"
                element={
                  <RequireAuth
                    icon={ShoppingBag}
                    title="Sign in to see your cart"
                    message="Log in or create an account to add items to your cart and check out."
                  >
                    <Cart />
                  </RequireAuth>
                }
              />
              <Route
                path="/wishlist"
                element={
                  <RequireAuth
                    icon={Heart}
                    title="Sign in to see your wishlist"
                    message="Log in or create an account to save items you like for later."
                  >
                    <Wishlist />
                  </RequireAuth>
                }
              />
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
              <Route
                path="/checkout"
                element={
                  <RequireAuth
                    icon={ShoppingBag}
                    title="Sign in to check out"
                    message="Log in or create an account to place your order."
                  >
                    <Placeholder title="Checkout" />
                  </RequireAuth>
                }
              />
              <Route
                path="/account/*"
                element={
                  <RequireAuth
                    icon={UserRound}
                    title="Sign in to see your profile"
                    message="Log in or create an account to manage your details, addresses and orders."
                  >
                    <Suspense
                      fallback={
                        <div className="app_placeholder" role="status">
                          <p>Loading...</p>
                        </div>
                      }
                    >
                      <AccountRoutes />
                    </Suspense>
                  </RequireAuth>
                }
              />
              <Route
                path="/search"
                element={<Placeholder title="Search results" />}
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </AccountProvider>
      </main>

      {!isAuthPage && (
        <div className="app_footer">
          <Footer />
        </div>
      )}
      {/* The product page has its own purchase bar in that spot */}
      {!isAuthPage && !pathname.startsWith("/product/") && (
        <BottomNav user={navUser} cartCount={itemCount} />
      )}
    </>
  );
}

export default App;
