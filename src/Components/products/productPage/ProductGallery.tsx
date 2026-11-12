import { useEffect, useRef, useState } from "react";
import { ImageOff } from "lucide-react";
import "./productGallery.css";

interface ProductGalleryProps {
  images: string[];
  name: string;
}

// Swipe sideways on a phone (the browser does the scrolling and snapping),
// thumbnails on tablet and desktop. The frame is a fixed square, so nothing jumps while images load.
function ProductGallery({ images, name }: ProductGalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState<Set<number>>(() => new Set());

  const slides = images.length > 0 ? images : [""];
  const total = slides.length;

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  function handleScroll() {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const el = trackRef.current;
      if (!el || el.clientWidth === 0) return;
      setIndex(Math.min(total - 1, Math.max(0, Math.round(el.scrollLeft / el.clientWidth))));
    });
  }

  function goTo(i: number) {
    const el = trackRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: i * el.clientWidth, behavior: reduce ? "auto" : "smooth" });
    setIndex(i);
  }

  const markFailed = (i: number) => setFailed((prev) => new Set(prev).add(i));

  return (
    <div className="product-gallery">
      <div className="product-gallery__frame">
        <div
          ref={trackRef}
          className="product-gallery__track"
          role="group"
          aria-roledescription="carousel"
          aria-label={`${name}, photos`}
          tabIndex={0}
          onScroll={handleScroll}
        >
          {slides.map((src, i) => (
            <div className="product-gallery__slide" key={`${src}-${i}`}>
              {src && !failed.has(i) ? (
                <img
                  className="product-gallery__image"
                  src={src}
                  alt={`${name}, photo ${i + 1} of ${total}`}
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : undefined}
                  decoding="async"
                  draggable={false}
                  onError={() => markFailed(i)}
                />
              ) : (
                <ImageOff size={40} aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
        {total > 1 && (
          <p className="product-gallery__counter" aria-live="polite">
            {index + 1}/{total}
          </p>
        )}
      </div>

      {total > 1 && (
        <ul className="product-gallery__thumbs">
          {slides.map((src, i) => (
            <li key={`${src}-${i}`}>
              <button
                type="button"
                className={`product-gallery__thumb${i === index ? " product-gallery__thumb--active" : ""}`}
                aria-label={`Show photo ${i + 1} of ${total}`}
                aria-current={i === index}
                onClick={() => goTo(i)}
              >
                {src && !failed.has(i) ? (
                  <img src={src} alt="" loading="lazy" draggable={false} onError={() => markFailed(i)} />
                ) : (
                  <ImageOff size={18} aria-hidden="true" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ProductGallery;
