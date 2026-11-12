import { Link, useNavigate } from "react-router-dom";
import { SlidersHorizontal, UserRound } from "lucide-react";
import { SearchBar } from "../../search/SearchBar";
import { useGreeting } from "../../../hooks/useGreeting";
import { BRAND_NAME } from "../../../data/brand";
import "./MobileNav.css";

interface MobileNavProps {
  user?: { name: string; avatarUrl?: string; birthday?: string } | null; // birthday: "MM-DD"
  justSignedIn?: boolean; // true right after sign in: shows "Welcome back"
  activeFilterCount?: number; // shows a small count on the filter button
  onFilterClick?: () => void;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function MobileNav({
  user = null,
  justSignedIn = false,
  activeFilterCount = 0,
  onFilterClick,
}: MobileNavProps) {
  const navigate = useNavigate();
  const firstName = user?.name.split(" ")[0];
  const headline = useGreeting({ birthday: user?.birthday, justSignedIn });

  return (
    <header className="mobile_nav_container">
      <Link className="mobile_profile" to="/account">
        <span className="mobile_avatar" aria-hidden="true">
          {user ? (
            user.avatarUrl ? (
              <img
                className="mobile_avatar_image"
                src={user.avatarUrl}
                alt=""
              />
            ) : (
              initials(user.name)
            )
          ) : (
            <UserRound size={22} />
          )}
        </span>
        <span className="mobile_greeting">
          <span className="mobile_greeting_sub">
            {user ? `Hi, ${firstName}` : `Welcome to ${BRAND_NAME}`}
          </span>
          <span className="mobile_greeting_main">
            {user ? headline : "Sign in"}
          </span>
        </span>
      </Link>

      <div className="mobile_nav_row">
        <div className="mobile_nav_search">
          <SearchBar
            onSearch={(term) =>
              navigate(`/search?q=${encodeURIComponent(term)}`)
            }
          />
        </div>
        <button
          className="mobile_filter"
          type="button"
          onClick={onFilterClick}
          aria-label={
            activeFilterCount > 0
              ? `Filters, ${activeFilterCount} applied`
              : "Filters"
          }
        >
          <SlidersHorizontal size={20} aria-hidden="true" />
          {activeFilterCount > 0 && (
            <span className="mobile_filter_badge" aria-hidden="true">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

export default MobileNav;
