import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Info } from "lucide-react";
import Avatar from "../../Components/Ui/Avatar";
import AccountNav from "./AccountNav";
import { useAccount } from "./AccountContext";
import "./account.css";

/**
 * 768px and up: sidebar beside the page.
 * Phones: no sidebar. The account home carries the section menu, and every other page has a
 * back button, so each screen is a focused full-width page.
 */
function AccountLayout() {
  const { profile } = useAccount();
  const { pathname } = useLocation();
  const contentRef = useRef<HTMLDivElement>(null);
  const lastPath = useRef(pathname);

  // After moving to another account page, put focus on its heading, so keyboard and
  // screen-reader users start at the top of the new page. Never on the first load.
  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    contentRef.current
      ?.querySelector<HTMLElement>("h1")
      ?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <div className="account">
      <div className="account__sidebar">
        <div className="account-identity">
          <Avatar name={profile.fullName} url={profile.avatarUrl} size="lg" />
          <div className="account-identity__text">
            <p className="account-identity__name">{profile.fullName}</p>
            <p className="account-identity__email">{profile.email}</p>
          </div>
        </div>
        <AccountNav variant="sidebar" />
      </div>

      <div className="account__content" ref={contentRef}>
        {/* Remove this note when the account is connected to a real backend (AccountProvider). */}
        <p className="account__sample">
          <Info size={16} aria-hidden="true" />
          <span>
            <strong>Sample data.</strong> This account is for preview; changes
            aren&rsquo;t saved to a server.
          </span>
        </p>
        <Outlet />
      </div>
    </div>
  );
}

export default AccountLayout;
