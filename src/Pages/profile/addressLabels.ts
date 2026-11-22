import { Briefcase, Home, MapPin, type LucideIcon } from "lucide-react";
import type { AddressLabel } from "./AccountContext";

export const ADDRESS_LABELS: AddressLabel[] = ["Home", "Work", "Other"];

export const LABEL_ICONS: Record<AddressLabel, LucideIcon> = {
  Home,
  Work: Briefcase,
  Other: MapPin,
};
