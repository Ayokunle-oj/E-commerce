import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Camera, Lock, ShieldCheck, Trash2 } from "lucide-react";
import Avatar from "../../Components/Ui/Avatar";
import Badge from "../../Components/Ui//Badge";
import { Button } from "../../Components/Ui//Button";
import FormField from "../../Components/Ui//FormField";
import { cleanSingleLine, LIMITS } from "./../../data/inputRules";
import { useAccount } from "./AccountContext";
import { formatPhone, isValidEmail, normalizePhone } from "./nigeria";
import Notice from "./Notice";
import PageHeader from "./PageHeader";
import "./profile.css";

interface Values {
  fullName: string;
  email: string;
  phone: string;
}
type Field = keyof Values;
type Errors = Partial<Record<Field, string>>;
type Message = { tone: "success" | "error"; text: string } | null;

const FIELD_ORDER: Field[] = ["fullName", "email", "phone"];
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const PHOTO_MAX_BYTES = 2 * 1024 * 1024;

function validate(values: Values): Errors {
  const errors: Errors = {};
  const name = cleanSingleLine(values.fullName, LIMITS.displayName);
  if (!name) errors.fullName = "Enter your full name.";
  else if (name.length < 2 || !/\p{L}/u.test(name))
    errors.fullName = "Enter your real name, using letters.";

  const email = values.email.trim();
  if (!email) errors.email = "Enter your email address.";
  else if (!isValidEmail(email))
    errors.email = "Enter a valid email address, like name@example.com.";

  if (!values.phone.trim()) errors.phone = "Enter your phone number.";
  else if (!normalizePhone(values.phone))
    errors.phone = "Enter a valid Nigerian mobile number, like 0803 123 4567.";
  return errors;
}

const memberSince = (iso: string) =>
  new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));

function Profile() {
  const { profile, saveProfile, setAvatar } = useAccount();

  const [values, setValues] = useState<Values>({
    fullName: profile.fullName,
    email: profile.email,
    phone: profile.phone ? formatPhone(profile.phone) : "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<Message>(null);
  const [photoMessage, setPhotoMessage] = useState<Message>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const submitting = useRef(false); // set synchronously, so a double tap cannot send twice

  const dirty =
    cleanSingleLine(values.fullName, LIMITS.displayName) !== profile.fullName ||
    values.email.trim().toLowerCase() !== profile.email ||
    (normalizePhone(values.phone) ?? values.phone.trim()) !==
      (profile.phone ?? "");

  const change = (field: Field) => (event: ChangeEvent<HTMLInputElement>) => {
    const next = { ...values, [field]: event.target.value };
    setValues(next);
    setMessage(null);
    // Once a field has shown an error, re-check as they type so it clears the moment it is fixed.
    if (errors[field])
      setErrors((current) => ({ ...current, [field]: validate(next)[field] }));
  };

  const blur = (field: Field) => () => {
    if (values[field].trim() || errors[field]) {
      setErrors((current) => ({
        ...current,
        [field]: validate(values)[field],
      }));
    }
  };

  const reset = () => {
    setValues({
      fullName: profile.fullName,
      email: profile.email,
      phone: profile.phone ? formatPhone(profile.phone) : "",
    });
    setErrors({});
    setMessage(null);
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

    const clean = {
      fullName: cleanSingleLine(values.fullName, LIMITS.displayName),
      email: values.email.trim().toLowerCase(),
      phone: normalizePhone(values.phone),
    };
    submitting.current = true;
    setSaving(true);
    setMessage(null);
    try {
      await saveProfile(clean);
      setValues({
        fullName: clean.fullName,
        email: clean.email,
        phone: clean.phone ? formatPhone(clean.phone) : "",
      });
      setMessage({ tone: "success", text: "Your profile has been updated." });
    } catch {
      // Their input stays in the form, so nothing has to be retyped.
      setMessage({
        tone: "error",
        text: "We couldn’t save your changes. Please check your connection and try again.",
      });
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  }

  function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // so choosing the same file again still fires
    if (!file) return;
    if (!PHOTO_TYPES.includes(file.type)) {
      setPhotoMessage({
        tone: "error",
        text: "Choose a JPG, PNG or WebP image.",
      });
      return;
    }
    if (file.size > PHOTO_MAX_BYTES) {
      setPhotoMessage({
        tone: "error",
        text: "That image is larger than 2 MB. Please choose a smaller one.",
      });
      return;
    }
    setAvatar(URL.createObjectURL(file));
    setPhotoMessage({ tone: "success", text: "Profile photo updated." });
  }

  return (
    <>
      <PageHeader
        title="Profile"
        description="Manage your personal information."
      />

      <div className="profile">
        <section className="account-card" aria-labelledby="profile-photo-title">
          <h2 className="account-card__title" id="profile-photo-title">
            Profile photo
          </h2>
          <div className="profile-photo">
            <Avatar name={profile.fullName} url={profile.avatarUrl} size="xl" />
            <div className="profile-photo__body">
              <div className="profile-photo__actions">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Camera size={16} aria-hidden="true" />}
                  onClick={() => fileRef.current?.click()}
                >
                  {profile.avatarUrl ? "Change photo" : "Upload photo"}
                </Button>
                {profile.avatarUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 size={16} aria-hidden="true" />}
                    onClick={() => {
                      setAvatar(null);
                      setPhotoMessage({
                        tone: "success",
                        text: "Profile photo removed.",
                      });
                    }}
                  >
                    Remove
                  </Button>
                )}
              </div>
              <p className="account-card__hint">
                JPG, PNG or WebP, up to 2 MB.
              </p>
              <input
                ref={fileRef}
                type="file"
                accept={PHOTO_TYPES.join(",")}
                hidden
                onChange={handlePhoto}
                aria-label="Choose a profile photo"
              />
            </div>
          </div>
          {photoMessage && (
            <Notice
              tone={photoMessage.tone}
              onDismiss={() => setPhotoMessage(null)}
            >
              {photoMessage.text}
            </Notice>
          )}
        </section>

        <section className="account-card" aria-labelledby="profile-info-title">
          <h2 className="account-card__title" id="profile-info-title">
            Personal information
          </h2>
          <form
            className="profile-form"
            ref={formRef}
            onSubmit={handleSubmit}
            noValidate
          >
            <FormField label="Full name" required error={errors.fullName}>
              {(control) => (
                <input
                  {...control}
                  name="fullName"
                  autoComplete="name"
                  maxLength={LIMITS.displayName}
                  value={values.fullName}
                  onChange={change("fullName")}
                  onBlur={blur("fullName")}
                  disabled={saving}
                />
              )}
            </FormField>

            <FormField
              label="Email address"
              required
              hint="We send order updates and receipts here."
              error={errors.email}
            >
              {(control) => (
                <input
                  {...control}
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  maxLength={254}
                  value={values.email}
                  onChange={change("email")}
                  onBlur={blur("email")}
                  disabled={saving}
                />
              )}
            </FormField>

            <FormField
              label="Phone number"
              required
              hint="Riders use this to reach you about deliveries."
              error={errors.phone}
            >
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
                  onChange={change("phone")}
                  onBlur={blur("phone")}
                  disabled={saving}
                />
              )}
            </FormField>

            {message && <Notice tone={message.tone}>{message.text}</Notice>}

            <div className="profile-form__actions">
              {dirty && !saving && (
                <Button variant="ghost" onClick={reset}>
                  Discard changes
                </Button>
              )}
              {/* onMouseDown: stops blur-validation from shifting the layout and losing this click */}
              <Button
                type="submit"
                loading={saving}
                disabled={!dirty && !saving}
                onMouseDown={(event) => event.preventDefault()}
              >
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>
        </section>

        <section
          className="account-card"
          aria-labelledby="profile-security-title"
        >
          <h2 className="account-card__title" id="profile-security-title">
            Sign-in &amp; security
          </h2>
          <div className="profile-row">
            <span className="profile-row__icon" aria-hidden="true">
              <Lock size={18} />
            </span>
            <div className="profile-row__text">
              <p className="profile-row__label" id="profile-password-label">
                Password
              </p>
              <p className="profile-row__value" id="profile-password-help">
                Use a strong password you don&rsquo;t use anywhere else.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              disabled
              aria-labelledby="profile-password-label"
              aria-describedby="profile-password-help profile-password-soon"
            >
              Change
            </Button>
          </div>
          <p className="account-card__hint" id="profile-password-soon">
            Password changes will be available once sign-in is connected.
          </p>
        </section>

        <section
          className="account-card"
          aria-labelledby="profile-account-title"
        >
          <h2 className="account-card__title" id="profile-account-title">
            Account
          </h2>
          <dl className="profile-facts">
            <div>
              <dt>Status</dt>
              <dd>
                <Badge tone="success" icon={ShieldCheck}>
                  Active
                </Badge>
              </dd>
            </div>
            <div>
              <dt>Member since</dt>
              <dd>{memberSince(profile.createdAt)}</dd>
            </div>
          </dl>
        </section>
      </div>
    </>
  );
}

export default Profile;
