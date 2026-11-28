import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "../../Components/Ui/Button";
import ConfirmDialog from "../../Components/Ui/ConfirmDialog";
import { useAuth } from "../../auth/authContext";

// Log out, after asking. The question is a bottom sheet on phones.
function SignOutButton() {
  const { signOut } = useAuth();
  const [asking, setAsking] = useState(false);

  return (
    <>
      <Button
        variant="secondary"
        icon={<LogOut size={16} aria-hidden="true" />}
        onClick={() => setAsking(true)}
      >
        Log out
      </Button>
      <ConfirmDialog
        open={asking}
        title="Log out?"
        description="Are you sure you want to log out of your account?"
        confirmLabel="Yes, log out"
        onCancel={() => setAsking(false)}
        onConfirm={() => {
          setAsking(false);
          signOut();
        }}
      />
    </>
  );
}

export default SignOutButton;
