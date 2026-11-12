import { useRef, useState, type TouchEvent } from "react";
import { Link } from "react-router-dom";
import {
  Backpack,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Pause,
  Play,
  Smartphone,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import "./AdBoard.css";

export interface Ad {
  id: string;
  title: string;
  subtitle?: string;
  tag?: string; // small label like "New" or "Hot deal"
  cta?: string; // button text, defaults to "Shop now"
  to: string; // where the ad links to
  image?: string; // product photo; falls back to the icon
  icon?: LucideIcon;
  tone?: "primary" | "dark" | "accent" | "light";
}

interface AdBoardProps {
  ads?: Ad[];
  intervalMs?: number; // time each ad stays on screen
  label?: string;
}

// Sample ads. Replace with your real ones.
const sampleAds: Ad[] = [
  {
    id: "bags",
    tag: "New",
    title: "Back to school bags",
    subtitle: "Strong, light and made for campus life.",
    to: "/search?q=Bags",
    icon: Backpack,
    tone: "primary",
  },
  {
    id: "earbuds",
    tag: "Hot deal",
    title: "Earbuds that last all day",
    subtitle: "Clear sound for lectures and late-night study.",
    to: "/search?q=Earbuds",
    icon: Headphones,
    tone: "dark",
  },
  {
    id: "phones",
    tag: "Just in",
    title: "Phones for every budget",
    subtitle: "Browse the latest arrivals and pick yours.",
    to: "/search?q=Phones",
    icon: Smartphone,
    tone: "accent",
  },
  {
    id: "beauty",
    tag: "Beauty",
    title: "Skincare and beauty favourites",
    subtitle: "Simple picks to keep you looking fresh.",
    to: "/search?q=Beauty",
    icon: Sparkles,
    tone: "light",
  },
];

function AdBoard({
  ads = sampleAds,
  intervalMs = 5000,
  label = "Featured offers",
}: AdBoardProps) {
  const count = ads.length;
  const [index, setIndex] = useState(0);
  // Start paused for people who asked their device to reduce motion
  const [playing, setPlaying] = useState(
    () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  if (count === 0) return null;

  const next = () => setIndex((i) => (i + 1) % count);
  const prev = () => setIndex((i) => (i - 1 + count) % count);
  const tone = ads[index]?.tone ?? "primary";

  function handleTouchStart(event: TouchEvent<HTMLElement>) {
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  }

  function handleTouchEnd(event: TouchEvent<HTMLElement>) {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    // Only count a mostly-horizontal swipe, so normal page scrolling is not hijacked
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next();
      else prev();
    }
  }

  return (
    <div className="ad-board-wrap">
      <section
        className={`ad-board ad-board--${tone}${playing ? "" : " ad-board--paused"}`}
        aria-roledescription="carousel"
        aria-label={label}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") next();
          if (event.key === "ArrowLeft") prev();
        }}
      >
        <div className="ad-board__viewport" aria-live={playing ? "off" : "polite"}>
          {ads.map((ad, i) => {
            const active = i === index;
            const Icon = ad.icon;
            return (
              <article
                key={ad.id}
                className={`ad-board__slide ad-board__slide--${ad.tone ?? "primary"}${
                  active ? " ad-board__slide--active" : ""
                }`}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${count}`}
                aria-hidden={!active}
              >
                <div className="ad-board__content">
                  {ad.tag && <span className="ad-board__tag">{ad.tag}</span>}
                  <p className="ad-board__title">{ad.title}</p>
                  {ad.subtitle && <p className="ad-board__subtitle">{ad.subtitle}</p>}
                  <Link className="ad-board__cta" to={ad.to} tabIndex={active ? 0 : -1}>
                    {ad.cta ?? "Shop now"}
                  </Link>
                </div>
                <div className="ad-board__media" aria-hidden="true">
                  {ad.image ? (
                    <img className="ad-board__image" src={ad.image} alt="" />
                  ) : Icon ? (
                    <span className="ad-board__icon">
                      <Icon size={72} />
                    </span>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>

        {count > 1 && (
          <>
            {/* Progress bars: the active one fills over intervalMs, and its end moves to the next ad */}
            <div className="ad-board__dots">
              {ads.map((ad, i) => (
                <button
                  key={ad.id}
                  type="button"
                  className="ad-board__dot"
                  aria-label={`Show ad ${i + 1}: ${ad.title}`}
                  aria-current={i === index ? "true" : undefined}
                  onClick={() => setIndex(i)}
                >
                  <span className="ad-board__track">
                    {i === index && (
                      <span
                        className="ad-board__fill"
                        style={{ animationDuration: `${intervalMs}ms` }}
                        onAnimationEnd={next}
                      />
                    )}
                  </span>
                </button>
              ))}
            </div>

            <div className="ad-board__controls">
              <button
                type="button"
                className="ad-board__button"
                aria-label={playing ? "Pause slideshow" : "Play slideshow"}
                onClick={() => setPlaying((p) => !p)}
              >
                {playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
              </button>
              <button
                type="button"
                className="ad-board__button ad-board__arrow"
                aria-label="Previous ad"
                onClick={prev}
              >
                <ChevronLeft size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="ad-board__button ad-board__arrow"
                aria-label="Next ad"
                onClick={next}
              >
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default AdBoard;
