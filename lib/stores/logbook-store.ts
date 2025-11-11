import { useDebugValue, useRef, useSyncExternalStore } from "react";
import { createStore } from "zustand/vanilla";

export type AccountProfile = {
  id: string;
  name: string;
  email: string;
  defaultRole: "Crew" | "Trainer" | "Co-Skipper";
  birthYear?: number;
};

export type Delegate = {
  id: string;
  accountId: string;
  name: string;
  email: string;
  canRead: boolean;
  canWrite: boolean;
};

export type GpsTrack = {
  id: string;
  title: string;
  startedAt: string;
  durationMinutes: number;
  distanceKm: number;
};

export type Trip = {
  id: string;
  title: string;
  boat: string;
  distance: number;
  duration: string;
  dateISO: string;
  start: string;
  target: string;
  crew: number;
  status: "Abgeschlossen" | "In Planung" | "Auswertung";
  ownerId: string;
};

export type TrainingCrewGroup = {
  id: string;
  name: string;
  description: string;
  focus: string;
  members: {
    name: string;
    role: string;
    isGuest: boolean;
    birthYear: number | null;
    accountId?: string | null;
  }[];
};

const accountDirectory: AccountProfile[] = [
  {
    id: "account-001",
    name: "Nils Brenner",
    email: "nils@masys.app",
    defaultRole: "Co-Skipper",
    birthYear: 1992,
  },
  {
    id: "account-002",
    name: "Mara Lenz",
    email: "mara.lenz@bsv.de",
    defaultRole: "Trainer",
    birthYear: 1999,
  },
  {
    id: "account-003",
    name: "Kim Albrecht",
    email: "kim.albrecht@masys.app",
    defaultRole: "Crew",
    birthYear: 2008,
  },
  {
    id: "account-004",
    name: "Luis Kramer",
    email: "luis.kramer@masys.app",
    defaultRole: "Crew",
    birthYear: 2007,
  },
  {
    id: "account-005",
    name: "Sabine Köster",
    email: "sabine.koester@bsv.de",
    defaultRole: "Trainer",
    birthYear: 1988,
  },
];

const initialTracks: GpsTrack[] = [
  {
    id: "TRACK-1093",
    title: "Abendrunde Havel",
    startedAt: "2024-06-12T18:05:00.000Z",
    durationMinutes: 85,
    distanceKm: 16.4,
  },
  {
    id: "TRACK-1092",
    title: "Training Spinnaker",
    startedAt: "2024-06-09T14:15:00.000Z",
    durationMinutes: 70,
    distanceKm: 12.1,
  },
  {
    id: "TRACK-1091",
    title: "Küstentörn Rügen",
    startedAt: "2024-06-07T09:00:00.000Z",
    durationMinutes: 365,
    distanceKm: 58.4,
  },
];

const initialDelegates: Delegate[] = [
  {
    id: "delegate-1",
    accountId: "account-001",
    name: "Nils Brenner",
    email: "nils@masys.app",
    canRead: true,
    canWrite: true,
  },
  {
    id: "delegate-2",
    accountId: "account-002",
    name: "Mara Lenz",
    email: "mara.lenz@bsv.de",
    canRead: true,
    canWrite: false,
  },
];

const trainingGroups: TrainingCrewGroup[] = [
  {
    id: "youth-a",
    name: "Jugend Team A",
    description: "Regatta-Crew U18 · Schwerpunkt Spinnaker",
    focus: "Spinnaker-Handling",
    members: [
      {
        name: "Kim Albrecht",
        role: "Crew",
        isGuest: false,
        birthYear: 2008,
        accountId: "account-003",
      },
      {
        name: "Luis Kramer",
        role: "Crew",
        isGuest: false,
        birthYear: 2007,
        accountId: "account-004",
      },
      {
        name: "Mara Lenz",
        role: "Trainer:in",
        isGuest: false,
        birthYear: 1999,
        accountId: "account-002",
      },
    ],
  },
  {
    id: "junior-basic",
    name: "Junior Basics",
    description: "Wochenkurs für Einsteiger:innen",
    focus: "Grundlagen & Sicherheit",
    members: [
      { name: "Janne Rehm", role: "Crew", isGuest: true, birthYear: 2010 },
      { name: "Nico Ewert", role: "Crew", isGuest: true, birthYear: 2011 },
      {
        name: "Sabine Köster",
        role: "Trainer:in",
        isGuest: false,
        birthYear: 1988,
        accountId: "account-005",
      },
    ],
  },
];

const trips: Trip[] = [
  {
    id: "TR-1093",
    title: "Abendregatta Elbe",
    boat: "Sun Odyssey 349",
    distance: 14.3,
    duration: "2 h 10 min",
    dateISO: "2024-06-12",
    start: "Wedel",
    target: "Norderelbe",
    crew: 4,
    status: "Abgeschlossen",
    ownerId: "me",
  },
  {
    id: "TR-1092",
    title: "Training – Spinnaker",
    boat: "Dehler 34",
    distance: 11.1,
    duration: "1 h 45 min",
    dateISO: "2024-06-09",
    start: "Hamburg",
    target: "Finkenwerder",
    crew: 3,
    status: "Auswertung",
    ownerId: "delegate-1",
  },
  {
    id: "TR-1091",
    title: "Küstentörn Rügen",
    boat: "Bavaria C38",
    distance: 38.6,
    duration: "6 h 05 min",
    dateISO: "2024-06-07",
    start: "Sassnitz",
    target: "Lohme",
    crew: 5,
    status: "Abgeschlossen",
    ownerId: "delegate-2",
  },
  {
    id: "TR-1088",
    title: "Nordsee Passage",
    boat: "Hanse 388",
    distance: 54.2,
    duration: "9 h 18 min",
    dateISO: "2024-05-31",
    start: "Cuxhaven",
    target: "Helgoland",
    crew: 6,
    status: "In Planung",
    ownerId: "me",
  },
];

export type LogbookStore = {
  accounts: AccountProfile[];
  delegates: Delegate[];
  tracks: GpsTrack[];
  trips: Trip[];
  trainingGroups: TrainingCrewGroup[];
  addTrack: (track: GpsTrack) => void;
  removeTrack: (id: string) => void;
  addDelegate: (payload: { accountId: string; canRead: boolean; canWrite: boolean }) => void;
  updateDelegatePermissions: (
    id: string,
    permissions: { canRead?: boolean; canWrite?: boolean },
  ) => void;
  removeDelegate: (id: string) => void;
};

export const formatDurationMinutes = (minutes: number) => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hrs > 0 ? `${hrs} h ${mins} min` : `${mins} min`;
};

const logbookStore = createStore<LogbookStore>((set, get) => ({
  accounts: accountDirectory,
  delegates: initialDelegates,
  tracks: initialTracks,
  trips,
  trainingGroups,
  addTrack: (track) =>
    set((state) => ({
      tracks: [track, ...state.tracks],
    })),
  removeTrack: (id) =>
    set((state) => ({
      tracks: state.tracks.filter((track) => track.id !== id),
    })),
  addDelegate: ({ accountId, canRead, canWrite }) =>
    set((state) => {
      const account = state.accounts.find((account) => account.id === accountId);
      if (!account) {
        return state;
      }
      const existingIndex = state.delegates.findIndex(
        (delegate) => delegate.accountId === accountId,
      );
      const delegateRecord: Delegate = {
        id:
          existingIndex >= 0
            ? state.delegates[existingIndex].id
            : `delegate-${Date.now()}`,
        accountId,
        name: account.name,
        email: account.email,
        canRead: canWrite ? true : canRead,
        canWrite,
      };
      if (existingIndex >= 0) {
        const delegates = [...state.delegates];
        delegates[existingIndex] = delegateRecord;
        return { ...state, delegates };
      }
      return { ...state, delegates: [...state.delegates, delegateRecord] };
    }),
  updateDelegatePermissions: (id, permissions) =>
    set((state) => ({
      delegates: state.delegates.map((delegate) => {
        if (delegate.id !== id) {
          return delegate;
        }
        const nextCanRead =
          permissions.canRead === undefined
            ? delegate.canRead
            : permissions.canRead;
        const nextCanWrite =
          permissions.canWrite === undefined
            ? delegate.canWrite
            : permissions.canWrite;
        return {
          ...delegate,
          canRead: nextCanWrite ? true : nextCanRead,
          canWrite: nextCanWrite,
        };
      }),
    })),
  removeDelegate: (id) =>
    set((state) => ({
      delegates: state.delegates.filter((delegate) => delegate.id !== id),
    })),
}));

const getCachedServerSnapshot = (() => {
  let snapshot: LogbookStore | undefined;
  return () => {
    if (!snapshot) {
      snapshot = logbookStore.getInitialState();
    }
    return snapshot;
  };
})();

const identitySelector = <T,>(state: T) => state;
const defaultEquality = Object.is;

export const useLogbookStore = <T = LogbookStore>(
  selector: (state: LogbookStore) => T = identitySelector as (state: LogbookStore) => T,
  equalityFn: (a: T, b: T) => boolean = defaultEquality,
) => {
  const state = useSyncExternalStore(
    logbookStore.subscribe,
    logbookStore.getState,
    getCachedServerSnapshot,
  );

  const hasSliceRef = useRef(false);
  const selectedSlice = selector(state);
  const sliceRef = useRef<T>(selectedSlice);

  if (!hasSliceRef.current) {
    hasSliceRef.current = true;
    sliceRef.current = selectedSlice;
  } else if (!equalityFn(selectedSlice, sliceRef.current)) {
    sliceRef.current = selectedSlice;
  }

  useDebugValue(sliceRef.current);

  return sliceRef.current;
};

export const getLogbookState = () => logbookStore.getState();
