import { createContext, useContext } from "react";

export type AddressLabel = "Home" | "Work" | "Other";

export interface Address {
  id: string;
  label: AddressLabel;
  fullName: string;
  phone: string; // +234XXXXXXXXXX
  state: string;
  city: string;
  area: string; // area / locality
  street: string;
  extra: string; // apartment, floor or landmark
  instructions: string; // delivery instructions for the rider
  isDefault: boolean;
}
export type AddressValues = Omit<Address, "id">;

export interface Profile {
  fullName: string;
  email: string;
  phone: string | null; // +234XXXXXXXXXX
  avatarUrl: string | null;
  createdAt: string; // ISO date
}
export type ProfileValues = Pick<Profile, "fullName" | "email" | "phone">;

export const MAX_ADDRESSES = 10;

export interface AccountContextValue {
  profile: Profile;
  addresses: Address[];
  saveProfile: (values: ProfileValues) => Promise<void>;
  /** Pass a photo, or null to remove it. */
  setAvatar: (file: File | null) => Promise<void>;
  /** Adds a new address, or updates the one with `id`. */
  saveAddress: (values: AddressValues, id?: string) => Promise<Address>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
}

export const AccountContext = createContext<AccountContextValue | null>(null);

export function useAccount(): AccountContextValue {
  const value = useContext(AccountContext);
  if (!value)
    throw new Error("useAccount must be used inside <AccountProvider>");
  return value;
}
