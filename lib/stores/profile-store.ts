import { useDebugValue } from "react";
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector";
import { createStore } from "zustand/vanilla";

export type ProfileStat = {
  label: string;
  value: string;
};

export type ProfileStore = {
  stats: ProfileStat[];
};

const stats: ProfileStat[] = [
  { label: "Gesamtpunkte", value: "1.280" },
  { label: "Distanz", value: "642 km" },
  { label: "Segelstunden", value: "84 h" },
  { label: "Törns dieses Jahr", value: "18" },
];

const profileStore = createStore<ProfileStore>(() => ({
  stats,
}));

const getCachedServerSnapshot = (() => {
  let snapshot: ProfileStore | undefined;
  return () => {
    if (!snapshot) {
      snapshot = profileStore.getInitialState();
    }
    return snapshot;
  };
})();

const identitySelector = <T,>(state: T) => state;
const defaultEquality = Object.is;

export const useProfileStore = <T = ProfileStore>(
  selector: (state: ProfileStore) => T = identitySelector as (
    state: ProfileStore
  ) => T,
  equalityFn: (a: T, b: T) => boolean = defaultEquality
) => {
  const selectedSlice = useSyncExternalStoreWithSelector(
    profileStore.subscribe,
    profileStore.getState,
    getCachedServerSnapshot,
    selector,
    equalityFn
  );

  useDebugValue(selectedSlice);

  return selectedSlice;
};

export const getProfileState = () => profileStore.getState();
