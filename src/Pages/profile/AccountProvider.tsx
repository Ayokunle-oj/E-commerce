import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  AccountContext,
  type AccountContextValue,
  type Address,
  type Profile,
} from "./AccountContext";
import { useAuth } from "../../auth/authContext";
import { demoServer } from "../../demo/demoServer";

// All account data comes from src/demo/demoServer.ts for now. To connect the real backend,
// change that file; this provider keeps asking it the same questions.
// App.tsx remounts this provider on sign-in and sign-out (key), so the first value is always
// the right person's. Guests never reach the account pages, so they get an empty placeholder.
const GUEST_PROFILE: Profile = {
  fullName: "",
  email: "",
  phone: null,
  avatarUrl: null,
  createdAt: "",
};

export function AccountProvider({ children }: { children: ReactNode }) {
  const { user, updateUser } = useAuth();
  const userId = user?.id ?? null;

  const [profile, setProfile] = useState<Profile>(() =>
    userId ? demoServer.getAccount(userId).profile : GUEST_PROFILE,
  );
  const [addresses, setAddresses] = useState<Address[]>(() =>
    userId ? demoServer.getAccount(userId).addresses : [],
  );

  const refreshAddresses = useCallback(() => {
    if (userId) setAddresses(demoServer.getAccount(userId).addresses);
  }, [userId]);

  const applyProfile = useCallback(
    (next: Profile) => {
      setProfile(next);
      updateUser({
        fullName: next.fullName,
        email: next.email,
        phone: next.phone,
        avatarUrl: next.avatarUrl,
      });
    },
    [updateUser],
  );

  const saveProfile = useCallback<AccountContextValue["saveProfile"]>(
    async (values) => {
      if (!userId) return;
      applyProfile(await demoServer.updateProfile(userId, values));
    },
    [userId, applyProfile],
  );

  const setAvatar = useCallback<AccountContextValue["setAvatar"]>(
    async (file) => {
      if (!userId) return;
      applyProfile(await demoServer.saveAvatar(userId, file));
    },
    [userId, applyProfile],
  );

  const saveAddress = useCallback<AccountContextValue["saveAddress"]>(
    async (values, id) => {
      if (!userId) throw new Error("Not signed in.");
      const saved = await demoServer.saveAddress(userId, values, id);
      refreshAddresses();
      return saved;
    },
    [userId, refreshAddresses],
  );

  const deleteAddress = useCallback<AccountContextValue["deleteAddress"]>(
    async (id) => {
      if (!userId) return;
      await demoServer.deleteAddress(userId, id);
      refreshAddresses();
    },
    [userId, refreshAddresses],
  );

  const setDefaultAddress = useCallback<
    AccountContextValue["setDefaultAddress"]
  >(
    async (id) => {
      if (!userId) return;
      await demoServer.setDefaultAddress(userId, id);
      refreshAddresses();
    },
    [userId, refreshAddresses],
  );

  const value = useMemo<AccountContextValue>(
    () => ({
      profile,
      addresses,
      saveProfile,
      setAvatar,
      saveAddress,
      deleteAddress,
      setDefaultAddress,
    }),
    [
      profile,
      addresses,
      saveProfile,
      setAvatar,
      saveAddress,
      deleteAddress,
      setDefaultAddress,
    ],
  );

  return (
    <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
  );
}
