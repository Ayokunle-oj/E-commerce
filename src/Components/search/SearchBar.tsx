import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import "./SearchBar.css";

export interface SearchBarProps {
  onSearch: (term: string) => void;
  initialValue?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  onSearch,
  initialValue = "",
  placeholder = "Search Quikit",
  autoFocus = false,
}: SearchBarProps) {
  const [value, setValue] = useState(initialValue);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = value.trim();
    if (!term) return;
    onSearch(term);
  }

  return (
    <form className="search-bar" role="search" onSubmit={handleSubmit}>
      <input
        className="search-bar__input"
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        autoFocus={autoFocus}
      />
      <button className="search-bar__submit" type="submit" aria-label="Search">
        <Search size={20} aria-hidden="true" />
      </button>
    </form>
  );
}
