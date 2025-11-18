import { useDebugValue } from "react";
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector";
import { createStore } from "zustand/vanilla";

export type SelectOption = {
  label: string;
  value: string;
};

export type TripOptionsStore = {
  boatOptions: SelectOption[];
  weatherOptions: SelectOption[];
};

const boatOptions: SelectOption[] = [
  { label: "Sun Odyssey 349", value: "sun-odyssey-349" },
  { label: "Dehler 34", value: "dehler-34" },
  { label: "Hanse 388", value: "hanse-388" },
];

const weatherOptions: SelectOption[] = [
  { label: "leicht (2-3 Bft)", value: "leichter-wind" },
  { label: "mittel (4-5 Bft)", value: "mittlerer-wind" },
  { label: "stark (6+ Bft)", value: "starker-wind" },
];

const tripOptionsStore = createStore<TripOptionsStore>(() => ({
  boatOptions,
  weatherOptions,
}));

const getCachedServerSnapshot = (() => {
  let snapshot: TripOptionsStore | undefined;
  return () => {
    if (!snapshot) {
      snapshot = tripOptionsStore.getInitialState();
    }
    return snapshot;
  };
})();

const identitySelector = <T,>(state: T) => state;
const defaultEquality = Object.is;

export const useTripOptionsStore = <T = TripOptionsStore>(
  selector: (state: TripOptionsStore) => T = identitySelector as (
    state: TripOptionsStore
  ) => T,
  equalityFn: (a: T, b: T) => boolean = defaultEquality
) => {
  const selectedSlice = useSyncExternalStoreWithSelector(
    tripOptionsStore.subscribe,
    tripOptionsStore.getState,
    getCachedServerSnapshot,
    selector,
    equalityFn
  );

  useDebugValue(selectedSlice);

  return selectedSlice;
};

export const getTripOptionsState = () => tripOptionsStore.getState();
