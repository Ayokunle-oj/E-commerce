import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  AccountContext,
  type AccountContextValue,
  type Address,
  type AddressValues,
  type Profile,
} from "./AccountContext";

// ─────────────────────────────────────────────────────────────────────────────
// TEMPORARY SAMPLE DATA. Nothing here is a real customer, and nothing is sent to a server.
// Every change lives in memory and is lost on refresh. The account screens show a
// "Sample data" note while this provider is in use.
//
// TO CONNECT THE BACKEND: replace the sample values below with the signed-in customer, and
// replace the body of each function (the `await wait()` stands in for the network call)
// with a real request. The pages do not need to change.
// ─────────────────────────────────────────────────────────────────────────────
const SAMPLE_PROFILE: Profile = {
  fullName: "David Adeyemi",
  email: "david.adeyemi@example.com",
  phone: "+2348031234567",
  avatarUrl: null,
  createdAt: "2026-03-12",
};

const SAMPLE_ADDRESSES: Address[] = [
  {
    id: "sample-1",
    label: "Home",
    fullName: "David Adeyemi",
    phone: "+2348031234567",
    state: "Oyo",
    city: "Ibadan",
    area: "Bodija",
    street: "14 Oluyole Crescent, off Ring Road",
    extra: "Block B, Flat 3",
    instructions: "Call when you reach the gate. The security man will let you in.",
    isDefault: true,
  },
  {
    id: "sample-2",
    label: "Work",
    fullName: "David Adeyemi",
    phone: "+2348031234567",
    state: "Lagos",
    city: "Ikeja",
    area: "Allen Avenue",
    street: "27 Allen Avenue",
    extra: "3rd floor, Suite 12",
    instructions: "",
    isDefault: false,
  },
];

const wait = (ms = 450) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const newId = () => `addr-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export function AccountProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(SAMPLE_PROFILE);
  const [addresses, setAddresses] = useState<Address[]>(SAMPLE_ADDRESSES);

  const saveProfile = useCallback<AccountContextValue["saveProfile"]>(async (values) => {
    await wait();
    setProfile((current) => ({ ...current, ...values }));
  }, []);

  const setAvatar = useCallback((url: string | null) => {
    setProfile((current) => {
      // Free the memory of a photo that is being replaced.
      if (current.avatarUrl?.startsWith("blob:")) URL.revokeObjectURL(current.avatarUrl);
      return { ...current, avatarUrl: url };
    });
  }, []);

  const saveAddress = useCallback(
    async (values: AddressValues, id?: string): Promise<Address> => {
      await wait();
      const saved: Address = { ...values, id: id ?? newId() };
      setAddresses((current) => {
        const existing = current.find((a) => a.id === saved.id);
        // The first address is always the default, and a default cannot be un-set directly:
        // choose another address as the default instead.
        const isDefault = values.isDefault || current.length === 0 || Boolean(existing?.isDefault);
        const next: Address = { ...saved, isDefault };
        const cleared = isDefault ? current.map((a) => ({ ...a, isDefault: false })) : current;
        // An edited address keeps its place; a new one goes to the end.
        return existing ? cleared.map((a) => (a.id === next.id ? next : a)) : [...cleared, next];
      });
      return saved;
    },
    [],
  );

  const deleteAddress = useCallback(async (id: string) => {
    await wait();
    setAddresses((current) => {
      const remaining = current.filter((a) => a.id !== id);
      // If the default was deleted, the first remaining address takes over.
      if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
        remaining[0] = { ...remaining[0], isDefault: true };
      }
      return remaining;
    });
  }, []);

  const setDefaultAddress = useCallback(async (id: string) => {
    await wait(250);
    setAddresses((current) => current.map((a) => ({ ...a, isDefault: a.id === id })));
  }, []);

  const value = useMemo<AccountContextValue>(
    () => ({ profile, addresses, saveProfile, setAvatar, saveAddress, deleteAddress, setDefaultAddress }),
    [profile, addresses, saveProfile, setAvatar, saveAddress, deleteAddress, setDefaultAddress],
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}
