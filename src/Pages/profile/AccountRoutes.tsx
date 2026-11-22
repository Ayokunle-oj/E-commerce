import { Route, Routes } from "react-router-dom";
import AccountLayout from "./AccountLayout";
import Overview from "./Overview";
import Profile from "./Profile";
import Addresses from "./Addresses";
import PageHeader from "./PageHeader";
import EmptyState from "../../Components/Ui/EmptyState";
import { ButtonLink } from "../../Components/Ui/Button";
import ComingSoon from "./ComingSoon";

const COMING_SOON = [
  { path: "orders", title: "Orders" },
  { path: "delivery", title: "Delivery" },
  { path: "coupons", title: "Coupons" },
  { path: "reviews", title: "Reviews" },
  { path: "settings", title: "Settings" },
  { path: "help", title: "Help Center" },
];

function AccountNotFound() {
  return (
    <>
      <PageHeader title="Page not found" />
      <EmptyState
        title="We couldn’t find that page"
        actions={<ButtonLink to="/account">Go to my account</ButtonLink>}
      >
        The address may be wrong, or the page may have moved.
      </EmptyState>
    </>
  );
}

/** Everything under /account/*. Loaded lazily by App.tsx. */
function AccountRoutes() {
  return (
    <Routes>
      <Route element={<AccountLayout />}>
        <Route index element={<Overview />} />
        <Route path="profile" element={<Profile />} />
        <Route path="addresses" element={<Addresses />} />
        {COMING_SOON.map(({ path, title }) => (
          <Route
            key={path}
            path={path}
            element={<ComingSoon title={title} />}
          />
        ))}
        <Route path="*" element={<AccountNotFound />} />
      </Route>
    </Routes>
  );
}

export default AccountRoutes;
