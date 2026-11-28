import { Link } from "react-router-dom";
import {
  ArrowRight,
  Heart,
  MapPin,
  Package,
  Pencil,
  ShieldCheck,
} from "lucide-react";
import Avatar from "../../Components/Ui/Avatar";
import Badge from "../../Components/Ui/Badge";
import { ButtonLink } from "../../Components/Ui/Button";
import EmptyState from "../../Components/Ui/EmptyState";
import ProductThumb from "./../../Components/cartItem/ProductThumb";
import { useCart } from "./../../context/useCart";
import { formatNaira } from "./../cart/cartUtils";
import { useAccount } from "./AccountContext";
import { LABEL_ICONS } from "./addressLabels";
import { addressLines, formatPhone } from "./nigeria";
import AccountNav from "./AccountNav";
import PageHeader from "./PageHeader";
import SignOutButton from "./SignOutButton";
import "./overview.css";

const memberSince = (iso: string) =>
  new Intl.DateTimeFormat("en-NG", { month: "long", year: "numeric" }).format(
    new Date(iso),
  );

function Overview() {
  const { profile, addresses } = useAccount();
  const { wishlist } = useCart();
  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];
  const savedPreview = wishlist.slice(0, 4);

  return (
    <>
      <PageHeader title="My account" backTo={false} />

      <section
        className="overview-profile"
        aria-labelledby="overview-profile-name"
      >
        <Avatar name={profile.fullName} url={profile.avatarUrl} size="xl" />
        <h2 className="overview-profile__name" id="overview-profile-name">
          {profile.fullName}
        </h2>
        <p className="overview-profile__contact">
          <span>{profile.email}</span>
          <span>
            {profile.phone
              ? formatPhone(profile.phone)
              : "No phone number added"}
          </span>
        </p>
        <div className="overview-profile__status">
          <Badge tone="success" icon={ShieldCheck}>
            Active account
          </Badge>
          <span>Member since {memberSince(profile.createdAt)}</span>
        </div>
        <ButtonLink
          to="/account/profile"
          variant="secondary"
          size="sm"
          icon={<Pencil size={16} aria-hidden="true" />}
        >
          Edit profile
        </ButtonLink>
      </section>

      <div className="overview-cards">
        <section className="overview-card" aria-labelledby="overview-orders">
          <div className="overview-card__head">
            <h2 className="overview-card__title" id="overview-orders">
              Recent orders
            </h2>
          </div>
          <EmptyState
            compact
            icon={Package}
            title="No orders yet"
            actions={
              <ButtonLink to="/" size="sm">
                Start shopping
              </ButtonLink>
            }
          >
            When you place an order, you&rsquo;ll be able to track it here.
          </EmptyState>
        </section>

        <section className="overview-card" aria-labelledby="overview-address">
          <div className="overview-card__head">
            <h2 className="overview-card__title" id="overview-address">
              Delivery address
            </h2>
            <Link className="overview-card__link" to="/account/addresses">
              Manage <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          {defaultAddress ? (
            <div className="overview-address">
              <div className="overview-address__tags">
                <Badge tone="info" icon={LABEL_ICONS[defaultAddress.label]}>
                  {defaultAddress.label}
                </Badge>
                <Badge tone="success">Default</Badge>
              </div>
              <p className="overview-address__name">
                {defaultAddress.fullName}
              </p>
              {addressLines(defaultAddress).map((line) => (
                <p className="overview-address__line" key={line}>
                  {line}
                </p>
              ))}
              <p className="overview-address__line">
                {formatPhone(defaultAddress.phone)}
              </p>
            </div>
          ) : (
            <EmptyState
              compact
              icon={MapPin}
              title="No saved address"
              actions={
                <ButtonLink to="/account/addresses" size="sm">
                  Add address
                </ButtonLink>
              }
            >
              Save an address to check out faster.
            </EmptyState>
          )}
        </section>
      </div>

      <section className="overview-card" aria-labelledby="overview-wishlist">
        <div className="overview-card__head">
          <h2 className="overview-card__title" id="overview-wishlist">
            Wishlist
          </h2>
          {wishlist.length > 0 && (
            <Link className="overview-card__link" to="/wishlist">
              View all ({wishlist.length}){" "}
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          )}
        </div>
        {savedPreview.length > 0 ? (
          <ul className="overview-saved">
            {savedPreview.map((product) => (
              <li key={product.id}>
                <Link
                  className="overview-saved__item"
                  to={`/product/${product.id}`}
                >
                  <ProductThumb image={product.image} />
                  <span className="overview-saved__name">{product.name}</span>
                  <span className="overview-saved__price">
                    {formatNaira(product.price)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            compact
            icon={Heart}
            title="Nothing saved yet"
            actions={
              <ButtonLink to="/" size="sm">
                Browse products
              </ButtonLink>
            }
          >
            Tap the heart on a product to save it for later.
          </EmptyState>
        )}
      </section>

      {/* Phones: the full list of account sections. On wider screens the sidebar does this job. */}
      <section className="overview-menu" aria-labelledby="overview-menu-title">
        <h2 className="overview-heading" id="overview-menu-title">
          All account sections
        </h2>
        <AccountNav variant="menu" />
      </section>

      <div className="overview-logout">
        <SignOutButton />
      </div>
    </>
  );
}

export default Overview;
