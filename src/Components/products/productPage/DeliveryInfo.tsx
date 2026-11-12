import { MapPin, Receipt, Truck } from "lucide-react";
import { DELIVERY_FEE, formatNaira } from "../../../Pages/cart/cartUtils";
import "./deliveryInfo.css";

interface DeliveryInfoProps {
  delivery?: { minDays: number; maxDays: number };
}

function arrivalText({ minDays, maxDays }: { minDays: number; maxDays: number }) {
  return minDays === maxDays
    ? `Arrives in ${maxDays} days`
    : `Arrives in ${minDays} to ${maxDays} days`;
}

// The delivery fee always has its own line. It is added at checkout, never hidden.
function DeliveryInfo({ delivery }: DeliveryInfoProps) {
  return (
    <section className="delivery-info" aria-label="Delivery">
      <ul className="delivery-info__list">
        {delivery && (
          <li className="delivery-info__row">
            <Truck size={18} aria-hidden="true" />
            <span>{arrivalText(delivery)}</span>
          </li>
        )}
        <li className="delivery-info__row">
          <MapPin size={18} aria-hidden="true" />
          <span>Pick up on campus or get it delivered to your hostel</span>
        </li>
        <li className="delivery-info__row">
          <Receipt size={18} aria-hidden="true" />
          <span>Delivery fee {formatNaira(DELIVERY_FEE)}, added at checkout</span>
        </li>
      </ul>
    </section>
  );
}

export default DeliveryInfo;
