import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@fontsource-variable/inter";
import "@fontsource-variable/bricolage-grotesque";
import "./fonts.css";
import "./roots.css";
import App from "./App";
import ErrorBoundary from "./Components/errorBoundary/ErrorBoundary";
import { ThemeProvider } from "./theme/ThemeProvider";
import { CartProvider } from "./context/CartProvider";
import { AuthProvider } from "./auth/AuthProvider";

// The outer boundary is the last safety net: it catches crashes in the navbars,
// the providers or the router itself, which the one inside App cannot reach.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
