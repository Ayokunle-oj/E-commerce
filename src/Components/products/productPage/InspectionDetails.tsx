import { Check, ShieldCheck, X } from "lucide-react";
import type { Inspection } from "../../../data/productExtras";
import QualityMeter from "./QualityMeter";
import "./inspectionDetails.css";

interface InspectionDetailsProps {
  quality?: number;
  inspection: Inspection;
}

const dateFormat = new Intl.DateTimeFormat("en-NG", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatDate(iso: string) {
  const date = new Date(`${iso}T12:00:00`);
  return Number.isNaN(date.getTime()) ? iso : dateFormat.format(date);
}

// What stands behind the Verified badge. Only shown for products that are verified
// AND have real inspection data. Never fill this in with guesses.
function InspectionDetails({ quality, inspection }: InspectionDetailsProps) {
  return (
    <section className="inspection-details" aria-labelledby="inspection-title">
      <h2 className="inspection-details__title" id="inspection-title">
        <ShieldCheck size={20} aria-hidden="true" />
        Inspection details
      </h2>

      {quality !== undefined && <QualityMeter quality={quality} />}

      <ul className="inspection-details__checks">
        {inspection.checks.map(({ label, passed }) => (
          <li className="inspection-details__check" key={label}>
            {passed ? (
              <Check
                className="inspection-details__pass"
                size={16}
                aria-hidden="true"
              />
            ) : (
              <X
                className="inspection-details__fail"
                size={16}
                aria-hidden="true"
              />
            )}
            <span>
              {label}
              <span className="inspection-details__sr">
                {passed ? ": passed" : ": failed"}
              </span>
            </span>
          </li>
        ))}
      </ul>

      {inspection.note && (
        <p className="inspection-details__note">{inspection.note}</p>
      )}
      <p className="inspection-details__date">
        Checked by Fimba Go on {formatDate(inspection.checkedOn)}
      </p>
    </section>
  );
}

export default InspectionDetails;
