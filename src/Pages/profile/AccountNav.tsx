import { NavLink } from "react-router-dom";
import {
  ChevronRight,
  Heart,
  LayoutGrid,
  LifeBuoy,
  MapPin,
  Package,
  Settings,
  Star,
  Ticket,
  Truck,
  UserRound,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  summary: string;
  end?: boolean;
  /** Page not built yet: the link works but is tagged "Soon". */
  soon?: boolean;
}

const GROUPS: { label: string | null; items: NavItem[] }[] = [
  {
    label: null,
    items: [{ label: "Overview", to: "/account", icon: LayoutGrid, summary: "Your account at a glance", end: true }],
  },
  {
    label: "Shopping",
    items: [
      { label: "Orders", to: "/account/orders", icon: Package, summary: "Order history and tracking", soon: true },
      { label: "Delivery", to: "/account/delivery", icon: Truck, summary: "Active and past deliveries", soon: true },
      { label: "Wishlist", to: "/wishlist", icon: Heart, summary: "Items you have saved" },
      { label: "Coupons", to: "/account/coupons", icon: Ticket, summary: "Your coupon book", soon: true },
      { label: "Reviews", to: "/account/reviews", icon: Star, summary: "Products you have reviewed", soon: true },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Profile", to: "/account/profile", icon: UserRound, summary: "Name, email, phone and photo" },
      { label: "Addresses", to: "/account/addresses", icon: MapPin, summary: "Your delivery addresses" },
      { label: "Settings", to: "/account/settings", icon: Settings, summary: "Notifications, privacy and security", soon: true },
    ],
  },
  {
    label: "Support",
    items: [{ label: "Help Center", to: "/account/help", icon: LifeBuoy, summary: "FAQs and contact support", soon: true }],
  },
];

/**
 * "sidebar": compact list beside the page (768px and wider).
 * "menu":    the phone menu on the account home, with a summary line and chevron per row.
 */
function AccountNav({ variant }: { variant: "sidebar" | "menu" }) {
  return (
    <nav className={`account-nav account-nav--${variant}`} aria-label="Account">
      {GROUPS.filter((group) => variant === "sidebar" || group.label !== null).map((group, index) => {
        const labelId = `account-nav-${variant}-${index}`;
        return (
          <div className="account-nav__group" key={group.label ?? "main"}>
            {group.label && (
              <p className="account-nav__label" id={labelId}>
                {group.label}
              </p>
            )}
            <ul className="account-nav__list" aria-labelledby={group.label ? labelId : undefined}>
              {group.items.map(({ label, to, icon: Icon, summary, end, soon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      `account-nav__link${isActive ? " account-nav__link--active" : ""}`
                    }
                  >
                    <Icon size={20} aria-hidden="true" />
                    <span className="account-nav__text">
                      <span className="account-nav__name">{label}</span>
                      <span className="account-nav__summary">{summary}</span>
                    </span>
                    {soon && <span className="account-nav__soon">Soon</span>}
                    <ChevronRight className="account-nav__chevron" size={18} aria-hidden="true" />
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

export default AccountNav;
