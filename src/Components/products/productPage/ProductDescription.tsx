import { useId, useState } from "react";
import "./productDescription.css";

interface ProductDescriptionProps {
  text: string;
}

const READ_MORE_AFTER = 160; // characters

function ProductDescription({ text }: ProductDescriptionProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const long = text.length > READ_MORE_AFTER;

  return (
    <section className="product-description" aria-labelledby={`${id}-title`}>
      <h2 className="product-description__title" id={`${id}-title`}>
        Description
      </h2>
      <p
        id={id}
        className={`product-description__text${long && !open ? " product-description__text--clamped" : ""}`}
      >
        {text}
      </p>
      {long && (
        <button
          type="button"
          className="product-description__toggle"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Show less" : "Read more"}
        </button>
      )}
    </section>
  );
}

export default ProductDescription;
