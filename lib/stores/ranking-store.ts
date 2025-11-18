import { useDebugValue } from "react";
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector";
import { createStore } from "zustand/vanilla";

export type RankingEntry = {
  rank: number;
  name: string;
  points: number;
  distance: number;
  hours: number;
  isYou?: boolean;
};

export type RankingPeriodOption = { label: string; value: "month" | "quarter" | "all" };

export type RankingStore = {
  entries: RankingEntry[];
  periodOptions: RankingPeriodOption[];
};

const initialEntries: RankingEntry[] = [
  { rank: 1, name: "Laura Vogt", points: 1540, distance: 712, hours: 96 },
  { rank: 2, name: "Nils Brenner", points: 1495, distance: 698, hours: 90 },
  { rank: 3, name: "Du", points: 1280, distance: 642, hours: 84, isYou: true },
  { rank: 4, name: "Kim Albrecht", points: 1255, distance: 618, hours: 78 },
  { rank: 5, name: "Tom Reimann", points: 1180, distance: 580, hours: 75 },
  { rank: 6, name: "Mara Lenz", points: 1135, distance: 551, hours: 73 },
];

const periodOptions: RankingPeriodOption[] = [
  { label: "Aktueller Monat", value: "month" },
  { label: "Quartal", value: "quarter" },
  { label: "Gesamt", value: "all" },
];

const rankingStore = createStore<RankingStore>(() => ({
  entries: initialEntries,
  periodOptions,
}));

const getCachedServerSnapshot = (() => {
  let snapshot: RankingStore | undefined;
  return () => {
    if (!snapshot) {
      snapshot = rankingStore.getInitialState();
    }
    return snapshot;
  };
})();

const identitySelector = <T,>(state: T) => state;
const defaultEquality = Object.is;

export const useRankingStore = <T = RankingStore>(
  selector: (state: RankingStore) => T = identitySelector as (
    state: RankingStore
  ) => T,
  equalityFn: (a: T, b: T) => boolean = defaultEquality
) => {
  const selectedSlice = useSyncExternalStoreWithSelector(
    rankingStore.subscribe,
    rankingStore.getState,
    getCachedServerSnapshot,
    selector,
    equalityFn
  );

  useDebugValue(selectedSlice);

  return selectedSlice;
};

export const getRankingState = () => rankingStore.getState();
