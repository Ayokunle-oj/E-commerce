import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import EmptyState from "../Ui/EmptyState";
import { ButtonLink } from "../Ui/Button";
import "./signInRequired.css";

interface SignInRequiredProps {
  title: string;
  message: string;
  icon: LucideIcon;
}

// Full-page version of the sign-in prompt: what a guest sees on Account, Cart, Wishlist and Checkout.
function SignInRequired({ title, message, icon }: SignInRequiredProps) {
  const { pathname, search } = useLocation();
  const from = `${pathname}${search}`;

  useEffect(() => {
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);

  return (
    <div className="sign-in-required">
      <EmptyState
        icon={icon}
        title={title}
        actions={
          <>
            <ButtonLink to="/login" state={{ from }}>
              Log in
            </ButtonLink>
            <ButtonLink to="/signup" state={{ from }} variant="secondary">
              Create account
            </ButtonLink>
          </>
        }
      >
        {message}
      </EmptyState>
      <ButtonLink to="/" variant="ghost" size="sm">
        Keep browsing
      </ButtonLink>
    </div>
  );
}

export default SignInRequired;
