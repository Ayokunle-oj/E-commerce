import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { CircleAlert } from "lucide-react";
import ModalDialog from "../../Components/Ui/ModalDialog";
import { Button } from "../../Components/Ui/Button";
import FormField from "../../Components/Ui/FormField";
import { cleanMultiline, cleanSingleLine } from "./../../data/inputRules";
import {
  useAccount,
  type Address,
  type AddressLabel,
  type AddressValues,
} from "./AccountContext";
import { ADDRESS_LABELS, LABEL_ICONS } from "./addressLabels";
import { formatPhone, NIGERIAN_STATES, normalizePhone } from "./nigeria";

interface FormValues {
  label: AddressLabel;
  fullName: string;
  phone: string;
  state: string;
  city: string;
  area: string;
  street: string;
  extra: string;
  instructions: string;
  isDefault: boolean;
}
type TextField =
  | "fullName"
  | "phone"
  | "state"
  | "city"
  | "area"
  | "street"
  | "extra"
  | "instructions";
type Errors = Partial<Record<TextField, string>>;

const FIELD_ORDER: TextField[] = [
  "fullName",
  "phone",
  "state",
  "city",
  "area",
  "street",
  "extra",
  "instructions",
];

function validate(v: FormValues): Errors {
  const e: Errors = {};
  const name = cleanSingleLine(v.fullName, 60);
  if (!name) e.fullName = "Enter the recipient’s full name.";
  else if (name.length < 2 || !/\p{L}/u.test(name))
    e.fullName = "Enter a real name, using letters.";

  if (!v.phone.trim()) e.phone = "Enter a phone number the rider can call.";
  else if (!normalizePhone(v.phone))
    e.phone = "Enter a valid Nigerian mobile number, like 0803 123 4567.";

  if (!v.state) e.state = "Choose a state.";

  const city = cleanSingleLine(v.city, 60);
  if (!city) e.city = "Enter the city or town.";
  else if (city.length < 2) e.city = "City is too short.";

  const area = cleanSingleLine(v.area, 80);
  if (!area) e.area = "Enter the area or locality, for example Bodija.";
  else if (area.length < 2) e.area = "Area is too short.";

  const street = cleanSingleLine(v.street, 120);
  if (!street) e.street = "Enter the street address.";
  else if (street.length < 5)
    e.street = "Add the house number and street name.";

  if (cleanSingleLine(v.extra, 200).length > 100)
    e.extra = "Keep this under 100 characters.";
  if (cleanMultiline(v.instructions, 1000).length > 200)
    e.instructions = "Keep instructions under 200 characters.";
  return e;
}

interface AddressFormProps {
  open: boolean;
  /** The address being edited, or null to add a new one. */
  address: Address | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}

function AddressForm({ open, address, onClose, onSaved }: AddressFormProps) {
  const { profile, addresses, saveAddress } = useAccount();
  const isEdit = address !== null;

  // The dialog only mounts its children while open, so this starts fresh each time.
  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit address" : "Add a new address"}
      description="Riders use these details to find you, so please be as specific as you can."
      fullOnMobile
    >
      <AddressFields
        key={address?.id ?? "new"}
        initial={address}
        profileName={profile.fullName}
        profilePhone={profile.phone}
        isFirst={addresses.length === 0}
        onCancel={onClose}
        onSubmit={async (values) => {
          await saveAddress(values, address?.id);
          onSaved(isEdit ? "Address updated." : "Address added.");
        }}
      />
    </ModalDialog>
  );
}

interface AddressFieldsProps {
  initial: Address | null;
  profileName: string;
  profilePhone: string | null;
  isFirst: boolean;
  onCancel: () => void;
  onSubmit: (values: AddressValues) => Promise<void>;
}

function AddressFields({
  initial,
  profileName,
  profilePhone,
  isFirst,
  onCancel,
  onSubmit,
}: AddressFieldsProps) {
  const [values, setValues] = useState<FormValues>({
    label: initial?.label ?? "Home",
    fullName: initial?.fullName ?? profileName,
    phone: formatPhone(initial?.phone ?? profilePhone ?? ""),
    state: initial?.state ?? "",
    city: initial?.city ?? "",
    area: initial?.area ?? "",
    street: initial?.street ?? "",
    extra: initial?.extra ?? "",
    instructions: initial?.instructions ?? "",
    isDefault: initial?.isDefault ?? isFirst,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const submitting = useRef(false);

  // A default address cannot simply be un-ticked: make another address the default instead.
  const lockedDefault = Boolean(initial?.isDefault) || isFirst;

  const set =
    (field: TextField) =>
    (
      event: ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const next = { ...values, [field]: event.target.value };
      setValues(next);
      setFailed(false);
      if (errors[field])
        setErrors((current) => ({
          ...current,
          [field]: validate(next)[field],
        }));
    };

  const blur = (field: TextField) => () => {
    if (values[field].trim() || errors[field]) {
      setErrors((current) => ({
        ...current,
        [field]: validate(values)[field],
      }));
    }
  };

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting.current) return;

    const found = validate(values);
    setErrors(found);
    const firstInvalid = FIELD_ORDER.find((field) => found[field]);
    if (firstInvalid) {
      formRef.current
        ?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)
        ?.focus();
      return;
    }

    submitting.current = true;
    setSaving(true);
    setFailed(false);
    try {
      await onSubmit({
        label: values.label,
        fullName: cleanSingleLine(values.fullName, 60),
        phone: normalizePhone(values.phone) ?? values.phone,
        state: values.state,
        city: cleanSingleLine(values.city, 60),
        area: cleanSingleLine(values.area, 80),
        street: cleanSingleLine(values.street, 120),
        extra: cleanSingleLine(values.extra, 100),
        instructions: cleanMultiline(values.instructions, 200),
        isDefault: lockedDefault || values.isDefault,
      });
      // The parent closes the dialog on success.
    } catch {
      setFailed(true); // everything they typed stays in the form
      submitting.current = false;
      setSaving(false);
    }
  }

  return (
    <form
      className="address-form"
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
    >
      <fieldset className="address-form__labels" disabled={saving}>
        <legend className="address-form__legend">Save as</legend>
        <div className="address-form__chips">
          {ADDRESS_LABELS.map((label) => {
            const Icon = LABEL_ICONS[label];
            return (
              <label className="label-chip" key={label}>
                <input
                  type="radio"
                  name="label"
                  value={label}
                  checked={values.label === label}
                  onChange={() => setValues({ ...values, label })}
                />
                <Icon size={16} aria-hidden="true" />
                {label}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="address-form__grid">
        <FormField label="Full name" required error={errors.fullName}>
          {(control) => (
            <input
              {...control}
              name="fullName"
              autoComplete="name"
              maxLength={60}
              value={values.fullName}
              onChange={set("fullName")}
              onBlur={blur("fullName")}
              disabled={saving}
            />
          )}
        </FormField>

        <FormField label="Phone number" required error={errors.phone}>
          {(control) => (
            <input
              {...control}
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="0803 123 4567"
              maxLength={20}
              value={values.phone}
              onChange={set("phone")}
              onBlur={blur("phone")}
              disabled={saving}
            />
          )}
        </FormField>

        <FormField label="State" required error={errors.state}>
          {(control) => (
            <select
              {...control}
              name="state"
              autoComplete="address-level1"
              value={values.state}
              onChange={set("state")}
              onBlur={blur("state")}
              disabled={saving}
            >
              <option value="">Select a state</option>
              {NIGERIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          )}
        </FormField>

        <FormField label="City / town" required error={errors.city}>
          {(control) => (
            <input
              {...control}
              name="city"
              autoComplete="address-level2"
              maxLength={60}
              value={values.city}
              onChange={set("city")}
              onBlur={blur("city")}
              disabled={saving}
            />
          )}
        </FormField>

        <div className="address-form__wide">
          <FormField
            label="Area / locality"
            required
            hint="For example Bodija, Lekki Phase 1 or Wuse 2."
            error={errors.area}
          >
            {(control) => (
              <input
                {...control}
                name="area"
                maxLength={80}
                value={values.area}
                onChange={set("area")}
                onBlur={blur("area")}
                disabled={saving}
              />
            )}
          </FormField>
        </div>

        <div className="address-form__wide">
          <FormField label="Street address" required error={errors.street}>
            {(control) => (
              <input
                {...control}
                name="street"
                autoComplete="address-line1"
                maxLength={120}
                value={values.street}
                onChange={set("street")}
                onBlur={blur("street")}
                disabled={saving}
              />
            )}
          </FormField>
        </div>

        <div className="address-form__wide">
          <FormField
            label="Apartment, floor or landmark"
            hint="For example Block B, Flat 3, or opposite the pharmacy."
            error={errors.extra}
          >
            {(control) => (
              <input
                {...control}
                name="extra"
                autoComplete="address-line2"
                maxLength={100}
                value={values.extra}
                onChange={set("extra")}
                onBlur={blur("extra")}
                disabled={saving}
              />
            )}
          </FormField>
        </div>

        <div className="address-form__wide">
          <FormField
            label="Delivery instructions"
            hint={`${values.instructions.length}/200`}
            error={errors.instructions}
          >
            {(control) => (
              <textarea
                {...control}
                name="instructions"
                rows={2}
                maxLength={220}
                value={values.instructions}
                placeholder="Anything that helps the rider, like “Call at the gate”"
                onChange={set("instructions")}
                onBlur={blur("instructions")}
                disabled={saving}
              />
            )}
          </FormField>
        </div>
      </div>

      <label className="check">
        <input
          type="checkbox"
          checked={lockedDefault || values.isDefault}
          disabled={lockedDefault || saving}
          onChange={(event) =>
            setValues({ ...values, isDefault: event.target.checked })
          }
        />
        <span>
          Use as my default delivery address
          {lockedDefault && (
            <span className="check__hint">
              {isFirst && !initial
                ? "Your first address is always the default."
                : "To change your default, set another address as the default."}
            </span>
          )}
        </span>
      </label>

      {failed && (
        <p className="address-form__error" role="alert">
          <CircleAlert size={16} aria-hidden="true" />
          We couldn&rsquo;t save this address. Your details are still here, so
          please try again.
        </p>
      )}

      <div className="address-form__actions">
        <Button variant="ghost" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        {/* onMouseDown: keeps focus in the field, so its blur-validation cannot shift the layout
            and make the browser lose this click. Submitting still validates everything. */}
        <Button
          type="submit"
          loading={saving}
          onMouseDown={(event) => event.preventDefault()}
        >
          {saving ? "Saving…" : "Save address"}
        </Button>
      </div>
    </form>
  );
}

export default AddressForm;
