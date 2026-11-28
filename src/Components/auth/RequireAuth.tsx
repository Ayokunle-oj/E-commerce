import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "../../auth/authContext";
import SignInRequired from "./SignInRequired";

interface RequireAuthProps {
  title: string;
  message: string;
  icon: LucideIcon;
  children: ReactNode;
}

// Wrap a route's page. Signed in: the page. Guest: the sign-in screen (the page never loads).
function RequireAuth({ title, message, icon, children }: RequireAuthProps) {
  const { user } = useAuth();
  return user ? <>{children}</> : <SignInRequired title={title} message={message} icon={icon} />;
}

export default RequireAuth;
