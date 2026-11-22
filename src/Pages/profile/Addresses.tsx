import { useEffect, useRef, useState } from "react";
import { MapPin, Plus } from "lucide-react";
import { Button } from "../../Components/Ui/Button";
import ConfirmDialog from "../../Components/Ui/ConfirmDialog";
import EmptyState from "../../Components/Ui/EmptyState";
import { MAX_ADDRESSES, useAccount, type Address } from "./AccountContext";
import { addressLines, formatPhone } from "./nigeria";
import Notice from "./Notice";
import PageHeader from "./PageHeader";
import AddressCard from "./AddressCard";
import AddressForm from "./AddressForm";
import "./addresses.css";

type Message = { tone: "success" | "error"; text: string } | null;

function Addresses() {
  const { addresses, deleteAddress, setDefaultAddress } = useAccount();

  const [formFor, setFormFor] = useState<Address | "new" | null>(null);
  const [deleting, setDeleting] = useState<Address | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [defaultingId, setDefaultingId] = useState<string | null>(null);
  const [message, setMessage] = useState<Message>(null);
  const addRef = useRef<HTMLButtonElement>(null);

  const busy = deleteBusy || defaultingId !== null;
  const atLimit = addresses.length >= MAX_ADDRESSES;
  const ordered = [...addresses].sort(
    (a, b) => Number(b.isDefault) - Number(a.isDefault),
  );

  // Success messages fade away on their own; errors stay until dismissed.
  useEffect(() => {
    if (message?.tone !== "success") return;
    const timer = setTimeout(() => setMessage(null), 6000);
    return () => clearTimeout(timer);
  }, [message]);

  async function confirmDelete() {
    if (!deleting || deleteBusy) return;
    setDeleteBusy(true);
    setDeleteError(null);
    try {
      await deleteAddress(deleting.id);
      setDeleting(null);
      setMessage({
        tone: "success",
        text: `${deleting.label} address deleted.`,
      });
      // The Delete button that opened the dialog is gone, so give focus somewhere sensible.
      requestAnimationFrame(() => addRef.current?.focus());
    } catch {
      setDeleteError("We couldn’t delete this address. Please try again.");
    } finally {
      setDeleteBusy(false);
    }
  }

  async function makeDefault(address: Address) {
    if (busy) return;
    setDefaultingId(address.id);
    setMessage(null);
    try {
      await setDefaultAddress(address.id);
      setMessage({
        tone: "success",
        text: `${address.label} address is now your default.`,
      });
    } catch {
      setMessage({
        tone: "error",
        text: "We couldn’t change your default address. Please try again.",
      });
    } finally {
      setDefaultingId(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Addresses"
        description="Where we deliver your orders."
        actions={
          <Button
            ref={addRef}
            size="sm"
            icon={<Plus size={16} aria-hidden="true" />}
            disabled={atLimit}
            onClick={() => setFormFor("new")}
          >
            Add address
          </Button>
        }
      />

      {message && (
        <div className="addresses__notice">
          <Notice tone={message.tone} onDismiss={() => setMessage(null)}>
            {message.text}
          </Notice>
        </div>
      )}

      {addresses.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No saved addresses yet"
          actions={
            <Button
              icon={<Plus size={16} aria-hidden="true" />}
              onClick={() => setFormFor("new")}
            >
              Add your first address
            </Button>
          }
        >
          Save an address and you can choose it in one tap at checkout.
        </EmptyState>
      ) : (
        <>
          <ul className="addresses__list">
            {ordered.map((address) => (
              <li key={address.id}>
                <AddressCard
                  address={address}
                  busy={busy}
                  settingDefault={defaultingId === address.id}
                  onEdit={setFormFor}
                  onDelete={(a) => {
                    setDeleteError(null);
                    setDeleting(a);
                  }}
                  onMakeDefault={makeDefault}
                />
              </li>
            ))}
          </ul>
          <p className="addresses__count">
            {addresses.length} of {MAX_ADDRESSES} addresses saved
            {atLimit && ". Delete one to add another."}
          </p>
        </>
      )}

      <AddressForm
        open={formFor !== null}
        address={formFor === "new" ? null : formFor}
        onClose={() => setFormFor(null)}
        onSaved={(text) => {
          setFormFor(null);
          setMessage({ tone: "success", text });
        }}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="Delete this address?"
        description={
          deleting && (
            <>
              {deleting.label} &middot; {deleting.fullName}
              <br />
              {addressLines(deleting).join(", ")}
              <br />
              {formatPhone(deleting.phone)}
              {deleting.isDefault && addresses.length > 1 && (
                <>
                  <br />
                  <strong>
                    This is your default address. Another address will become
                    the default.
                  </strong>
                </>
              )}
            </>
          )
        }
        confirmLabel="Delete address"
        tone="danger"
        pending={deleteBusy}
        error={deleteError}
        onConfirm={confirmDelete}
        onCancel={() => !deleteBusy && setDeleting(null)}
      />
    </>
  );
}

export default Addresses;
