import type { ComponentPropsWithRef, ReactNode, Ref } from "react";
import { Link, type LinkProps } from "react-router-dom";
import "./button.css";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "sm";

interface ButtonStyleProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  icon?: ReactNode;
}

function classes({ variant = "primary", size = "md", fullWidth }: ButtonStyleProps) {
  return [
    "btn",
    `btn--${variant}`,
    size === "sm" ? "btn--sm" : "",
    fullWidth ? "btn--full" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

type ButtonProps = ComponentPropsWithRef<"button"> &
  ButtonStyleProps & {
    /**
     * Shows a spinner and blocks further clicks. The button stays focusable (aria-disabled,
     * not disabled) so keyboard focus is not lost mid-submit.
     */
    loading?: boolean;
  };

export function Button({
  variant,
  size,
  fullWidth,
  icon,
  loading = false,
  type = "button",
  className,
  onClick,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      className={`${classes({ variant, size, fullWidth })}${className ? ` ${className}` : ""}`}
      aria-busy={loading || undefined}
      aria-disabled={loading || rest.disabled || undefined}
      onClick={(event) => {
        if (loading) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
    >
      {loading ? (
        <span className="btn__spinner" aria-hidden="true" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}

type ButtonLinkProps = LinkProps &
  ButtonStyleProps & { ref?: Ref<HTMLAnchorElement> };

/** A react-router link that looks like a button. Use for navigation, Button for actions. */
export function ButtonLink({
  variant,
  size,
  fullWidth,
  icon,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link
      {...rest}
      className={`${classes({ variant, size, fullWidth })}${className ? ` ${className}` : ""}`}
    >
      {icon}
      {children}
    </Link>
  );
}
