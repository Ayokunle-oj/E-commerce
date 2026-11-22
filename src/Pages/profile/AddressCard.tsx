import { MessageSquareText, Pencil, Phone, Trash2 } from "lucide-react";
import Badge from "../../Components/Ui/Badge";
import { Button } from "../../Components/Ui/Button";
import type { Address } from "./AccountContext";
import { LABEL_ICONS } from "./addressLabels";
import { addressLines, formatPhone } from "./nigeria";

interface AddressCardProps {
  address: Address;
  /** True while this address is being made the default. */
  settingDefault: boolean;
  /** True while any address action is running, so only one thing happens at a time. */
  busy: boolean;
  onEdit: (address: Address) => void;
  onDelete: (address: Address) => void;
  onMakeDefault: (address: Address) => void;
}

function AddressCard({
  address,
  settingDefault,
  busy,
  onEdit,
  onDelete,
  onMakeDefault,
}: AddressCardProps) {
  const [first, second] = addressLines(address);
  const titleId = `address-${address.id}`;

  return (
    <article
      className={`address-card${address.isDefault ? " address-card--default" : ""}`}
      aria-labelledby={titleId}
    >
      <div className="address-card__body">
        <div className="address-card__tags">
          <Badge tone="info" icon={LABEL_ICONS[address.label]}>
            {address.label}
          </Badge>
          {address.isDefault && <Badge tone="success">Default</Badge>}
        </div>

        <h3 className="address-card__name" id={titleId}>
          {address.fullName}
        </h3>
        <p className="address-card__line">{first}</p>
        <p className="address-card__line">{second}</p>
        <p className="address-card__meta">
          <Phone size={14} aria-hidden="true" />
          {formatPhone(address.phone)}
        </p>
        {address.instructions && (
          <p className="address-card__meta">
            <MessageSquareText size={14} aria-hidden="true" />
            <span>{address.instructions}</span>
          </p>
        )}
      </div>

      <div className="address-card__actions">
        <Button
          variant="secondary"
          size="sm"
          icon={<Pencil size={16} aria-hidden="true" />}
          disabled={busy}
          onClick={() => onEdit(address)}
          aria-label={`Edit ${address.label} address`}
        >
          Edit
        </Button>
        {!address.isDefault && (
          <Button
            variant="ghost"
            size="sm"
            className="address-card__make-default"
            loading={settingDefault}
            disabled={busy && !settingDefault}
            onClick={() => onMakeDefault(address)}
            aria-label={`Set ${address.label} address as default`}
          >
            Set as default
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="address-card__delete"
          icon={<Trash2 size={16} aria-hidden="true" />}
          disabled={busy}
          onClick={() => onDelete(address)}
          aria-label={`Delete ${address.label} address`}
        >
          Delete
        </Button>
      </div>
    </article>
  );
}

export default AddressCard;
