import { useLocation } from "react-router-dom";
import ModalDialog from "../Ui/ModalDialog";
import { Button, ButtonLink } from "../Ui/Button";
import "./signInPrompt.css";

interface SignInPromptProps {
  /** The sentence shown to the guest. null keeps the sheet closed. */
  reason: string | null;
  onClose: () => void;
}

// The sheet a guest sees after tapping "To cart", the heart, and so on.
// Log in and Create account both remember the page, so the customer comes back here afterwards.
function SignInPrompt({ reason, onClose }: SignInPromptProps) {
  const { pathname, search } = useLocation();
  const from = `${pathname}${search}`;

  return (
    <ModalDialog
      open={reason !== null}
      onClose={onClose}
      title="Sign in to continue"
      description={reason}
    >
      <div className="sign-in-prompt">
        <ButtonLink to="/login" state={{ from }} fullWidth onClick={onClose}>
          Log in
        </ButtonLink>
        <ButtonLink
          to="/signup"
          state={{ from }}
          variant="secondary"
          fullWidth
          onClick={onClose}
        >
          Create account
        </ButtonLink>
        <Button variant="ghost" fullWidth onClick={onClose}>
          Keep browsing
        </Button>
        <p className="sign-in-prompt__note">
          You can search and view products without an account.
        </p>
      </div>
    </ModalDialog>
  );
}

export default SignInPrompt;
