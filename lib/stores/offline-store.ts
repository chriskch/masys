import { useDebugValue } from "react";
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector";
import { createStore } from "zustand/vanilla";

export type QueuedTrip = {
  id: string;
  title: string;
  createdAt: string;
};

export type OfflineStore = {
  queuedTrips: QueuedTrip[];
};

const initialQueuedTrips: QueuedTrip[] = [
  {
    id: "TR-1087",
    title: "Frühstückstörn",
    createdAt: "05. Juni 2024 – 07:30",
  },
  {
    id: "TR-1086",
    title: "Regattatraining",
    createdAt: "04. Juni 2024 – 18:10",
  },
];

const offlineStore = createStore<OfflineStore>(() => ({
  queuedTrips: initialQueuedTrips,
}));

const getCachedServerSnapshot = (() => {
  let snapshot: OfflineStore | undefined;
  return () => {
    if (!snapshot) {
      snapshot = offlineStore.getInitialState();
    }
    return snapshot;
  };
})();

const identitySelector = <T,>(state: T) => state;
const defaultEquality = Object.is;

export const useOfflineStore = <T = OfflineStore>(
  selector: (state: OfflineStore) => T = identitySelector as (
    state: OfflineStore
  ) => T,
  equalityFn: (a: T, b: T) => boolean = defaultEquality
) => {
  const selectedSlice = useSyncExternalStoreWithSelector(
    offlineStore.subscribe,
    offlineStore.getState,
    getCachedServerSnapshot,
    selector,
    equalityFn
  );

  useDebugValue(selectedSlice);

  return selectedSlice;
};

export const getOfflineState = () => offlineStore.getState();
