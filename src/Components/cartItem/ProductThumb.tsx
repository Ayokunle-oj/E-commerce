import { useState } from "react";
import { ImageOff } from "lucide-react";
import "./productThumb.css";

interface ProductThumbProps {
  image?: string;
}

// Fills the width of its parent and stays square.
function ProductThumb({ image }: ProductThumbProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="product-thumb">
      {image && !failed ? (
        <img
          className="product-thumb__image"
          src={image}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={() => setFailed(true)}
        />
      ) : (
        <ImageOff size={24} aria-hidden="true" />
      )}
    </div>
  );
}

export default ProductThumb;
