import { BadgePercent, BatteryCharging, Fan, ShieldCheck } from "lucide-react";
import type { Ad } from "../Components/Adborad/AdBoard";

// Ads for the Categories page. Give <AdBoard ads={categoryAds} /> this list and it
// rotates through them. Home keeps its own list, so each page shows different ads.
// These are SAMPLES: replace the wording and links with your real offers.
export const categoryAds: Ad[] = [
  {
    id: "cat-verified",
    tag: "Verified",
    title: "Shop products we have checked",
    subtitle: "Look for the Verified badge and the quality score.",
    to: "/categories?list=verified",
    cta: "See verified",
    icon: ShieldCheck,
    tone: "primary",
  },
  {
    id: "cat-hostel",
    tag: "Hostel",
    title: "Stay cool in your room",
    subtitle: "Desk fans and lamps for hostel life.",
    to: "/categories?cat=Fans",
    cta: "Shop fans",
    icon: Fan,
    tone: "dark",
  },
  {
    id: "cat-power",
    tag: "Gadgets",
    title: "Never run out of battery",
    subtitle: "Power banks and chargers for long lecture days.",
    to: "/categories?cat=Chargers",
    cta: "Shop chargers",
    icon: BatteryCharging,
    tone: "accent",
  },
  {
    id: "cat-drops",
    tag: "Price drops",
    title: "Prices just dropped",
    subtitle: "See what is cheaper than before.",
    to: "/categories?list=price-drops",
    cta: "See price drops",
    icon: BadgePercent,
    tone: "light",
  },
];
