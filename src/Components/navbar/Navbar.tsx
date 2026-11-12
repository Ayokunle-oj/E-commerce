import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, UserRound } from "lucide-react";
import { SearchBar } from "../search/SearchBar";
import { BRAND_NAME } from "../../data/brand";
import "./Navbar.css";

interface NavbarProps {
  user?: { name: string } | null;
  notificationCount?: number;
  cartCount?: number;
  cartTotal?: number;
}

const formatNaira = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;
const formatCount = (count: number) => (count > 99 ? "99+" : String(count));

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Navbar({
  user = null,
  notificationCount = 0,
  cartCount = 0,
  cartTotal = 0,
}: NavbarProps) {
  const navigate = useNavigate();

  const accountLabel =
    notificationCount > 0
      ? `Account, ${notificationCount} notifications`
      : "Account";
  const cartLabel = cartCount > 0 ? `Cart, ${cartCount} items` : "Cart";

  return (
    <div className="Navbar_container">
      <nav className="navbar_wrapper" aria-label="Primary">
        <Link className="logo" to="/">
          {BRAND_NAME}
        </Link>

        <div className="navbar_search">
          <SearchBar
            onSearch={(term) =>
              navigate(`/search?q=${encodeURIComponent(term)}`)
            }
          />
        </div>

        <div className="navbar_action">
          <Link
            className="navbar__link"
            to="/account"
            aria-label={accountLabel}
          >
            <span className="navbar__icon-wrap">
              {user ? (
                <span className="navbar__avatar" aria-hidden="true">
                  {initials(user.name)}
                </span>
              ) : (
                <UserRound size={24} aria-hidden="true" />
              )}
              {notificationCount > 0 && (
                <span
                  className="navbar__badge navbar__badge--alert"
                  aria-hidden="true"
                >
                  {formatCount(notificationCount)}
                </span>
              )}
            </span>
            <span className="navbar__action-text">
              <span className="navbar__action-sub">
                {user ? `Hi, ${user.name.split(" ")[0]}` : "Sign in"}
              </span>
              <span className="navbar__action-main">Account</span>
            </span>
          </Link>

          <Link className="navbar__link" to="/cart" aria-label={cartLabel}>
            <span className="navbar__icon-wrap">
              <ShoppingBag size={24} aria-hidden="true" />
              {cartCount > 0 && (
                <span
                  className="navbar__badge navbar__badge--cart"
                  aria-hidden="true"
                >
                  {formatCount(cartCount)}
                </span>
              )}
            </span>
            <span className="navbar__action-text">
              <span className="navbar__action-sub">Cart</span>
              <span className="navbar__action-main">
                {formatNaira(cartTotal)}
              </span>
            </span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
