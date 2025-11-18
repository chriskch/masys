import { useDebugValue } from "react";
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector";
import { createStore } from "zustand/vanilla";

export type NavItem = {
  href: string;
  icon: string;
  label: string;
};

export type NavigationStore = {
  navItems: NavItem[];
  hideNavPaths: string[];
};

const navItems: NavItem[] = [
  { href: "/", icon: "pi pi-home", label: "Dashboard" },
  { href: "/trips", icon: "pi pi-compass", label: "Törns" },
  { href: "/new-trip", icon: "pi pi-plus-circle", label: "Törn starten" },
  { href: "/ranking", icon: "pi pi-chart-line", label: "Rangliste" },
  { href: "/profile", icon: "pi pi-user", label: "Profil" },
];

const hideNavPaths = ["/auth"];

const navigationStore = createStore<NavigationStore>(() => ({
  navItems,
  hideNavPaths,
}));

const getCachedServerSnapshot = (() => {
  let snapshot: NavigationStore | undefined;
  return () => {
    if (!snapshot) {
      snapshot = navigationStore.getInitialState();
    }
    return snapshot;
  };
})();

const identitySelector = <T,>(state: T) => state;
const defaultEquality = Object.is;

export const useNavigationStore = <T = NavigationStore>(
  selector: (state: NavigationStore) => T = identitySelector as (
    state: NavigationStore
  ) => T,
  equalityFn: (a: T, b: T) => boolean = defaultEquality
) => {
  const selectedSlice = useSyncExternalStoreWithSelector(
    navigationStore.subscribe,
    navigationStore.getState,
    getCachedServerSnapshot,
    selector,
    equalityFn
  );

  useDebugValue(selectedSlice);

  return selectedSlice;
};

export const getNavigationState = () => navigationStore.getState();
