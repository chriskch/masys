import { useDebugValue } from "react";
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector";
import { createStore } from "zustand/vanilla";

export type DashboardStat = {
  label: string;
  value: string;
  icon: string;
  accent: string;
};

export type RecentTripSummary = {
  id: string;
  title: string;
  date: string;
  distance: string;
  duration: string;
  status: "Abgeschlossen" | "Auswertung" | "Geplant";
};

export type DashboardStore = {
  stats: DashboardStat[];
  recentTrips: RecentTripSummary[];
};

const initialStats: DashboardStat[] = [
  {
    label: "Gesamtpunkte",
    value: "1.280",
    icon: "pi pi-star",
    accent: "bg-[rgba(1,168,10,0.15)] text-(--color-primary)",
  },
  {
    label: "Seemeilen",
    value: "642 km",
    icon: "pi pi-compass",
    accent: "bg-[rgba(1,168,93,0.15)] text-(--color-primary-strong)",
  },
  {
    label: "Segelstunden",
    value: "84 h",
    icon: "pi pi-clock",
    accent: "bg-[rgba(1,159,168,0.15)] text-[#019fa8]",
  },
  {
    label: "Crewtage",
    value: "36",
    icon: "pi pi-users",
    accent: "bg-[rgba(94,1,168,0.15)] text-[#5e01a8]",
  },
];

const initialRecentTrips: RecentTripSummary[] = [
  {
    id: "TR-1093",
    title: "Abendregatta Elbe",
    date: "12. Juni 2024",
    distance: "14,3 km",
    duration: "2 h 10 min",
    status: "Abgeschlossen",
  },
  {
    id: "TR-1092",
    title: "Training – Spinnaker",
    date: "09. Juni 2024",
    distance: "11,1 km",
    duration: "1 h 45 min",
    status: "Auswertung",
  },
  {
    id: "TR-1091",
    title: "Küstentörn Rügen",
    date: "07. Juni 2024",
    distance: "38,6 km",
    duration: "6 h 05 min",
    status: "Abgeschlossen",
  },
];

const dashboardStore = createStore<DashboardStore>(() => ({
  stats: initialStats,
  recentTrips: initialRecentTrips,
}));

const getCachedServerSnapshot = (() => {
  let snapshot: DashboardStore | undefined;
  return () => {
    if (!snapshot) {
      snapshot = dashboardStore.getInitialState();
    }
    return snapshot;
  };
})();

const identitySelector = <T,>(state: T) => state;
const defaultEquality = Object.is;

export const useDashboardStore = <T = DashboardStore>(
  selector: (state: DashboardStore) => T = identitySelector as (state: DashboardStore) => T,
  equalityFn: (a: T, b: T) => boolean = defaultEquality,
) => {
  const selectedSlice = useSyncExternalStoreWithSelector(
    dashboardStore.subscribe,
    dashboardStore.getState,
    getCachedServerSnapshot,
    selector,
    equalityFn,
  );

  useDebugValue(selectedSlice);

  return selectedSlice;
};

export const getDashboardState = () => dashboardStore.getState();
