import { formatNaira, type Totals } from "../../Pages/cart/cartUtils";
import PromoCode from "../../Components/cartItem/PromoCode";
import "./cartSummary.css";

interface Props {
  totals: Totals;
  promoCode: string | null;
  onApplyPromo: (code: string) => void;
  onRemovePromo: () => void;
  onCheckout: () => void;
  /** false while the checkout page does not exist: the button is disabled and says "coming soon" */
  checkoutReady?: boolean;
}

export default function CartSummary({
  totals,
  promoCode,
  onApplyPromo,
  onRemovePromo,
  onCheckout,
  checkoutReady = true,
}: Props) {
  const { subtotal, discount, delivery, total, itemCount } = totals;

  return (
    <section className="cart-summary" aria-labelledby="cart-summary-title">
      <h2 id="cart-summary-title" className="cart-summary__title">
        Order summary
      </h2>

      <PromoCode
        appliedCode={promoCode}
        onApply={onApplyPromo}
        onRemove={onRemovePromo}
      />

      <dl className="cart-summary__rows">
        <div className="cart-summary__row">
          <dt>
            Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
          </dt>
          <dd>{formatNaira(subtotal)}</dd>
        </div>
        <div className="cart-summary__row">
          <dt>Delivery fee</dt>
          <dd>{formatNaira(delivery)}</dd>
        </div>
        {discount > 0 && (
          <div className="cart-summary__row cart-summary__row--discount">
            <dt>Discount ({promoCode})</dt>
            <dd>−{formatNaira(discount)}</dd>
          </div>
        )}
        <div className="cart-summary__row cart-summary__row--total">
          <dt>Total</dt>
          <dd>{formatNaira(total)}</dd>
        </div>
      </dl>

      <button
        type="button"
        className="cart-summary__checkout"
        onClick={onCheckout}
        disabled={!checkoutReady}
      >
        {checkoutReady
          ? `Checkout for ${formatNaira(total)}`
          : "Checkout coming soon"}
      </button>
    </section>
  );
}
