import { useDebugValue } from "react";
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector";
import { createStore } from "zustand/vanilla";
import type { UserRole } from "./logbook-store";

export type SessionStore = {
  currentRole: UserRole;
  currentAccountId: string;
  setRole: (role: UserRole) => void;
  setAccountId: (accountId: string) => void;
};

const sessionStore = createStore<SessionStore>((set) => ({
  currentRole: "Admin",
  currentAccountId: "account-001",
  setRole: (role) => set({ currentRole: role }),
  setAccountId: (accountId) => set({ currentAccountId: accountId }),
}));

const getCachedServerSnapshot = (() => {
  let snapshot: SessionStore | undefined;
  return () => {
    if (!snapshot) {
      snapshot = sessionStore.getInitialState();
    }
    return snapshot;
  };
})();

const identitySelector = <T,>(state: T) => state;
const defaultEquality = Object.is;

export const useSessionStore = <T = SessionStore>(
  selector: (state: SessionStore) => T = identitySelector as (
    state: SessionStore
  ) => T,
  equalityFn: (a: T, b: T) => boolean = defaultEquality
) => {
  const selectedSlice = useSyncExternalStoreWithSelector(
    sessionStore.subscribe,
    sessionStore.getState,
    getCachedServerSnapshot,
    selector,
    equalityFn
  );

  useDebugValue(selectedSlice);

  return selectedSlice;
};

export const getSessionState = () => sessionStore.getState();
