import "./CategoryChips.css";

// A reusable row of category chips. "All" clears the choice.
interface CategoryChipsProps {
  categories: readonly string[];
  selected: string | null; // null means "All"
  onSelect: (category: string | null) => void;
  allLabel?: string;
}

function CategoryChips({
  categories,
  selected,
  onSelect,
  allLabel = "All",
}: CategoryChipsProps) {
  return (
    <div className="category-chips" role="group" aria-label="Categories">
      <button
        type="button"
        className="category-chips__chip"
        aria-pressed={selected === null}
        onClick={() => onSelect(null)}
      >
        {allLabel}
      </button>
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          className="category-chips__chip"
          aria-pressed={selected === category}
          onClick={() => onSelect(selected === category ? null : category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

export default CategoryChips;
