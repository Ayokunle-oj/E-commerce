import "./productSpecs.css";

interface ProductSpecsProps {
  details: { label: string; value: string }[];
}

function ProductSpecs({ details }: ProductSpecsProps) {
  if (details.length === 0) return null;

  return (
    <section className="product-specs">
      <h2 className="product-specs__title">Details</h2>
      <dl className="product-specs__list">
        {details.map(({ label, value }) => (
          <div className="product-specs__row" key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default ProductSpecs;
