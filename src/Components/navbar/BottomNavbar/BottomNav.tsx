import { NavLink } from "react-router-dom";
import { Grid2X2, Home, ShoppingBag, UserRound } from "lucide-react";
import "./BottomNav.css";

interface BottomNavProps {
  user?: { name: string; avatarUrl?: string } | null;
  cartCount?: number;
  notificationCount?: number;
}

const tabs = [
  { label: "Home", to: "/", icon: Home, end: true },
  { label: "Categories", to: "/categories", icon: Grid2X2, end: false },
  { label: "Cart", to: "/cart", icon: ShoppingBag, end: false },
  { label: "Account", to: "/account", icon: UserRound, end: false },
];

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

function BottomNav({
  user = null,
  cartCount = 0,
  notificationCount = 0,
}: BottomNavProps) {
  // Only needed when a count must be announced; otherwise the visible name is used.
  function ariaLabel(label: string) {
    if (label === "Cart" && cartCount > 0) return `Cart, ${cartCount} items`;
    if (label === "Account" && notificationCount > 0)
      return `Account, ${notificationCount} notifications`;
    return undefined;
  }

  return (
    <nav className="bottom-nav" aria-label="Mobile">
      <div className="bottom-nav__track">
        {tabs.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            aria-label={ariaLabel(label)}
            className={({ isActive }) =>
              `bottom-nav__item${isActive ? " bottom-nav__item--active" : ""}`
            }
          >
            <span className="bottom-nav__icon-wrap">
              {label === "Account" && user ? (
                <span className="bottom-nav__avatar" aria-hidden="true">
                  {user.avatarUrl ? (
                    <img
                      className="bottom-nav__avatar-image"
                      src={user.avatarUrl}
                      alt=""
                    />
                  ) : (
                    initials(user.name)
                  )}
                </span>
              ) : (
                <Icon size={22} aria-hidden="true" />
              )}
              {label === "Cart" && cartCount > 0 && (
                <span
                  className="bottom-nav__badge bottom-nav__badge--cart"
                  aria-hidden="true"
                >
                  {formatCount(cartCount)}
                </span>
              )}
              {label === "Account" && notificationCount > 0 && (
                <span
                  className="bottom-nav__badge bottom-nav__badge--alert"
                  aria-hidden="true"
                >
                  {formatCount(notificationCount)}
                </span>
              )}
            </span>
            <span className="bottom-nav__label">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default BottomNav;
