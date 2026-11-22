import { Hammer } from "lucide-react";
import EmptyState from "../../Components/Ui//EmptyState";
import { ButtonLink } from "../../Components/Ui//Button";
import PageHeader from "./PageHeader";

/** Honest placeholder for account sections that are not built yet. */
function ComingSoon({ title }: { title: string }) {
  return (
    <>
      <PageHeader title={title} />
      <EmptyState
        icon={Hammer}
        title={`${title} is coming soon`}
        actions={<ButtonLink to="/account">Back to overview</ButtonLink>}
      >
        We&rsquo;re still building this part of your account.
      </EmptyState>
    </>
  );
}

export default ComingSoon;
