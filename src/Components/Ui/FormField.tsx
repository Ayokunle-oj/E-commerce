import { useId, type ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import "./formField.css";

/** Spread these onto the input, select or textarea so label, hint and error are linked. */
export interface FieldControlProps {
  id: string;
  "aria-describedby": string | undefined;
  "aria-invalid": true | undefined;
  required: boolean;
}

interface FormFieldProps {
  label: string;
  hint?: string;
  error?: string | null;
  /** Optional fields are labelled "(optional)" instead of marking required ones with a star. */
  required?: boolean;
  children: (control: FieldControlProps) => ReactNode;
}

/**
 *   <FormField label="Full name" required error={errors.fullName}>
 *     {(control) => <input {...control} name="fullName" autoComplete="name" />}
 *   </FormField>
 */
function FormField({ label, hint, error, required = false, children }: FormFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : "", error ? errorId : ""].filter(Boolean).join(" ");

  return (
    <div className={`form-field${error ? " form-field--invalid" : ""}`}>
      <label className="form-field__label" htmlFor={id}>
        {label}
        {!required && <span className="form-field__optional"> (optional)</span>}
      </label>
      {children({
        id,
        "aria-describedby": describedBy || undefined,
        "aria-invalid": error ? true : undefined,
        required,
      })}
      {hint && (
        <p id={hintId} className="form-field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="form-field__error" role="alert">
          <CircleAlert size={16} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

export default FormField;
