import { SlidersHorizontal } from "lucide-react";
import "./FilterButton.css";

// A reusable "Filters" button. It only reports the click; the page decides what opens.
interface FilterButtonProps {
  count?: number; // how many filters are applied; shows a small number on the button
  onClick?: () => void;
}

function FilterButton({ count = 0, onClick }: FilterButtonProps) {
  return (
    <button
      type="button"
      className="filter-button"
      onClick={onClick}
      aria-haspopup="dialog"
      aria-label={count > 0 ? `Filters, ${count} applied` : "Filters"}
    >
      <SlidersHorizontal size={20} aria-hidden="true" />
      <span className="filter-button__label" aria-hidden="true">
        Filters
      </span>
      {count > 0 && (
        <span className="filter-button__badge" aria-hidden="true">
          {count}
        </span>
      )}
    </button>
  );
}

export default FilterButton;
