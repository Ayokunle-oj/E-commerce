import { useState, type FormEvent } from "react";
import { findPromo } from "../../Pages/cart/cartUtils";
import { Check } from "lucide-react";
import "./promoCode.css";

interface Props {
  appliedCode: string | null;
  onApply: (code: string) => void;
  onRemove: () => void;
}

export default function PromoCode({ appliedCode, onApply, onRemove }: Props) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const code = value.trim().toUpperCase();
    if (!code) {
      setError("Enter a promo code");
      return;
    }
    if (!findPromo(code)) {
      setError("This code isn't valid");
      return;
    }
    onApply(code);
    setValue("");
    setError("");
  }

  if (appliedCode) {
    return (
      <div className="promo-code promo-code--applied">
        <span className="promo-code__code">{appliedCode}</span>
        <span className="promo-code__status">
          <Check size={16} aria-hidden="true" />
          Promo applied
        </span>
        <button type="button" className="promo-code__remove" onClick={onRemove}>
          Remove
        </button>
      </div>
    );
  }

  return (
    <form className="promo-code" onSubmit={handleSubmit} noValidate>
      <label className="promo-code__label" htmlFor="promo-code-input">
        Promo code
      </label>
      <div className="promo-code__row">
        <input
          id="promo-code-input"
          className="promo-code__input"
          type="text"
          value={value}
          placeholder="Promo code"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "promo-code-error" : undefined}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError("");
          }}
        />
        <button type="submit" className="promo-code__apply">
          Apply
        </button>
      </div>
      {error && (
        <p id="promo-code-error" className="promo-code__error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
