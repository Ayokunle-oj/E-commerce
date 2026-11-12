import { Star } from "lucide-react";
import "./ratingStars.css";

interface RatingStarsProps {
  rating: number; // 0 to 5
  size?: number; // px
}

// Always five stars, filled up to the rating. 3.0 fills three, 4.5 fills four and a half.
function RatingStars({ rating, size = 12 }: RatingStarsProps) {
  const value = Number.isFinite(rating) ? Math.min(5, Math.max(0, rating)) : 0;
  const label = value > 0 ? `Rated ${value.toFixed(1)} out of 5` : "No ratings yet";

  return (
    <span className="rating-stars" role="img" aria-label={label}>
      {[0, 1, 2, 3, 4].map((i) => {
        const filled = Math.min(1, Math.max(0, value - i));
        return (
          <span className="rating-stars__star" key={i} style={{ width: size, height: size }}>
            <Star
              className="rating-stars__empty"
              size={size}
              fill="currentColor"
              stroke="none"
              aria-hidden="true"
            />
            <span className="rating-stars__fill" style={{ width: `${filled * 100}%` }}>
              <Star
                className="rating-stars__full"
                size={size}
                fill="currentColor"
                stroke="none"
                aria-hidden="true"
              />
            </span>
          </span>
        );
      })}
    </span>
  );
}

export default RatingStars;
