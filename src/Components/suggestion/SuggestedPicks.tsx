import { Link } from "react-router-dom";
import {
  Backpack,
  BatteryCharging,
  Bed,
  BookOpen,
  Camera,
  CookingPot,
  Dumbbell,
  Fan,
  Footprints,
  Gamepad2,
  Gem,
  Gift,
  Glasses,
  Headphones,
  Lamp,
  Laptop,
  PencilRuler,
  Shirt,
  Smartphone,
  Sparkles,
  Speaker,
  Watch,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import "./SuggestedPicks.css";

export interface Pick {
  label: string;
  to?: string; // defaults to a search for the label
  image?: string; // product photo; falls back to the icon
  icon?: LucideIcon;
}

interface SuggestedPicksProps {
  title?: string;
  picks?: Pick[];
  seeAllTo?: string; // where the link goes. Defaults to the Categories page
  seeAllLabel?: string;
}

const defaultPicks: Pick[] = [
  { label: "Bags", icon: Backpack },
  { label: "Phones", icon: Smartphone },
  { label: "Shoes", icon: Footprints },
  { label: "Watches", icon: Watch },
  { label: "Earbuds", icon: Headphones },
  { label: "Laptops", icon: Laptop },
  { label: "Fashion", icon: Shirt },
  { label: "Chargers", icon: BatteryCharging },
  { label: "Speakers", icon: Speaker },
  { label: "Gaming", icon: Gamepad2 },
  { label: "Cameras", icon: Camera },
  { label: "Eyewear", icon: Glasses },
  { label: "Jewelry", icon: Gem },
  { label: "Beauty", icon: Sparkles },
  { label: "Kitchen", icon: CookingPot },
  { label: "Lighting", icon: Lamp },
  { label: "Fans", icon: Fan },
  { label: "Bedding", icon: Bed },
  { label: "Books", icon: BookOpen },
  { label: "Stationery", icon: PencilRuler },
  { label: "Fitness", icon: Dumbbell },
  { label: "Gifts", icon: Gift },
];

function SuggestedPicks({
  title = "Suggested picks",
  picks = defaultPicks,
  seeAllTo = "/categories",
  seeAllLabel = "See all categories",
}: SuggestedPicksProps) {
  return (
    <section
      className="suggested_picks"
      aria-labelledby="suggested-picks-title"
    >
      <div className="suggested_picks_header">
        <h2 className="suggested_picks_title" id="suggested-picks-title">
          {title}
        </h2>
        <Link className="suggested_picks_see_all" to={seeAllTo}>
          {seeAllLabel}
          <ChevronRight size={16} aria-hidden="true" />
        </Link>
      </div>
      <ul className="suggested_picks_list">
        {picks.map(({ label, to, image, icon: Icon }) => (
          <li key={label} className="suggested_picks_item">
            <Link
              className="suggested_pick"
              to={to ?? `/search?q=${encodeURIComponent(label)}`}
            >
              <span className="suggested_pick_media" aria-hidden="true">
                {image ? (
                  <img
                    className="suggested_pick_image"
                    src={image}
                    alt=""
                    loading="lazy"
                  />
                ) : Icon ? (
                  <Icon size={28} />
                ) : null}
              </span>
              <span className="suggested_pick_label">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default SuggestedPicks;
