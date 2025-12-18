import { useDebugValue } from "react";
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector";
import { createStore } from "zustand/vanilla";

export type UserRole = "Admin" | "Trainer:in" | "Segler:in";

export type AccountProfile = {
  id: string;
  userId: number;
  name: string;
  email?: string;
  defaultRole: "Crew" | "Trainer" | "Co-Skipper";
  defaultBoatClass: string;
  role: UserRole;
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

export type DelegationAccess = {
  id: string;
  ownerAccountId: string;
  canRead: boolean;
  canWrite: boolean;
};

export type OwnershipLogEntry = {
  id: string;
  timestamp: string;
  action: "transfer" | "share";
  fromAccountId: string;
  toAccountId: string;
  actorAccountId: string;
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
  sharedOwnerIds: string[];
  ownershipLog: OwnershipLogEntry[];
  createdAt?: string;
};

export type CruiseEntry = {
  cruiseId: number;
  tripId: string;
  timestamp: string;
  start: string | null;
  destination: string | null;
  score: number;
  totalDistance: number;
  approachInKm: number;
  groupCruise: boolean;
  trainingCruise: boolean;
  regatta: boolean;
  startDate: string;
  endDate: string;
  season: string;
  creator: number;
};

export type SectionEntry = {
  sectionId: number;
  timestamp: string;
  cruiseId: number;
  inlandWithoutMotorKm: number;
  inlandWithoutMotorOptimistKm: number;
  oceanKm: number;
  againstCurrentKm: number;
  withMotorKm: number;
  numberOfMastTilts: number;
  numberOfLocks: number;
  startDate: string;
  endDate: string;
  windDirection: string | null;
  windForce: number | null;
  precipitationInMm: number | null;
  creator: number;
};

export type SectionUser = {
  sectionId: number;
  userId: number;
};

export type TrainingCrewGroup = {
  id: string;
  name: string;
  memberAccountIds: string[];
};

const accountDirectory: AccountProfile[] = [
  {
    id: "account-001",
    userId: 1,
    name: "Nils Brenner",
    email: "nils@masys.app",
    defaultRole: "Co-Skipper",
    defaultBoatClass: "J/70",
    role: "Admin",
    birthYear: 1992,
  },
  {
    id: "account-002",
    userId: 2,
    name: "Mara Lenz",
    email: "mara.lenz@bsv.de",
    defaultRole: "Trainer",
    defaultBoatClass: "B/One",
    role: "Trainer:in",
    birthYear: 1999,
  },
  {
    id: "account-003",
    userId: 3,
    name: "Kim Albrecht",
    defaultRole: "Crew",
    defaultBoatClass: "Optimist",
    role: "Segler:in",
    birthYear: 2008,
  },
  {
    id: "account-004",
    userId: 4,
    name: "Luis Kramer",
    email: "luis.kramer@masys.app",
    defaultRole: "Crew",
    defaultBoatClass: "Laser Pico",
    role: "Segler:in",
    birthYear: 2007,
  },
  {
    id: "account-005",
    userId: 5,
    name: "Sabine Köster",
    email: "sabine.koester@bsv.de",
    defaultRole: "Trainer",
    defaultBoatClass: "J/24",
    role: "Trainer:in",
    birthYear: 1988,
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

const incomingDelegations: DelegationAccess[] = [
  {
    id: "access-1",
    ownerAccountId: "account-002",
    canRead: true,
    canWrite: false,
  },
  {
    id: "access-2",
    ownerAccountId: "account-005",
    canRead: true,
    canWrite: true,
  },
];

const trainingGroups: TrainingCrewGroup[] = [
  {
    id: "youth-a",
    name: "Jugend Team A",
    memberAccountIds: ["account-003", "account-004", "account-002"],
  },
  {
    id: "junior-basic",
    name: "Junior Basics",
    memberAccountIds: ["account-005"],
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
    ownerId: "account-001",
    sharedOwnerIds: ["account-002"],
    ownershipLog: [
      {
        id: "own-log-1",
        timestamp: "2024-06-10T19:20:00.000Z",
        action: "share",
        fromAccountId: "account-001",
        toAccountId: "account-002",
        actorAccountId: "account-001",
      },
    ],
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
    ownerId: "account-002",
    sharedOwnerIds: ["account-001"],
    ownershipLog: [
      {
        id: "own-log-2",
        timestamp: "2024-06-08T17:00:00.000Z",
        action: "transfer",
        fromAccountId: "account-001",
        toAccountId: "account-002",
        actorAccountId: "account-001",
      },
    ],
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
    ownerId: "account-005",
    sharedOwnerIds: [],
    ownershipLog: [],
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
    ownerId: "account-001",
    sharedOwnerIds: [],
    ownershipLog: [],
  },
];

const cruises: CruiseEntry[] = [
  {
    cruiseId: 1093,
    tripId: "TR-1093",
    timestamp: "2024-06-12T17:00:00.000Z",
    start: "Wedel (SCW)",
    destination: "Norderelbe",
    score: 240,
    totalDistance: 14.3,
    approachInKm: 2.1,
    groupCruise: false,
    trainingCruise: false,
    regatta: true,
    startDate: "2024-06-12T17:05:00.000Z",
    endDate: "2024-06-12T19:15:00.000Z",
    season: "2024",
    creator: 1,
  },
  {
    cruiseId: 1092,
    tripId: "TR-1092",
    timestamp: "2024-06-09T14:00:00.000Z",
    start: "Hamburg",
    destination: "Finkenwerder",
    score: 165,
    totalDistance: 11.1,
    approachInKm: 1.3,
    groupCruise: false,
    trainingCruise: true,
    regatta: false,
    startDate: "2024-06-09T14:15:00.000Z",
    endDate: "2024-06-09T16:00:00.000Z",
    season: "2024",
    creator: 2,
  },
  {
    cruiseId: 1091,
    tripId: "TR-1091",
    timestamp: "2024-06-07T09:00:00.000Z",
    start: "Sassnitz",
    destination: "Lohme",
    score: 310,
    totalDistance: 38.6,
    approachInKm: 3.4,
    groupCruise: true,
    trainingCruise: false,
    regatta: false,
    startDate: "2024-06-07T09:00:00.000Z",
    endDate: "2024-06-07T15:05:00.000Z",
    season: "2024",
    creator: 5,
  },
];

const sections: SectionEntry[] = [
  {
    sectionId: 501,
    timestamp: "2024-06-12T17:10:00.000Z",
    cruiseId: 1093,
    inlandWithoutMotorKm: 2.4,
    inlandWithoutMotorOptimistKm: 0,
    oceanKm: 4.8,
    againstCurrentKm: 1.2,
    withMotorKm: 0,
    numberOfMastTilts: 0,
    numberOfLocks: 0,
    startDate: "2024-06-12T17:05:00.000Z",
    endDate: "2024-06-12T17:50:00.000Z",
    windDirection: "NO",
    windForce: 4,
    precipitationInMm: 0,
    creator: 1,
  },
  {
    sectionId: 502,
    timestamp: "2024-06-12T17:55:00.000Z",
    cruiseId: 1093,
    inlandWithoutMotorKm: 1.4,
    inlandWithoutMotorOptimistKm: 0,
    oceanKm: 5.5,
    againstCurrentKm: 0.8,
    withMotorKm: 0,
    numberOfMastTilts: 0,
    numberOfLocks: 0,
    startDate: "2024-06-12T17:50:00.000Z",
    endDate: "2024-06-12T18:30:00.000Z",
    windDirection: "NO",
    windForce: 4,
    precipitationInMm: 0,
    creator: 1,
  },
  {
    sectionId: 601,
    timestamp: "2024-06-09T14:20:00.000Z",
    cruiseId: 1092,
    inlandWithoutMotorKm: 3.5,
    inlandWithoutMotorOptimistKm: 0,
    oceanKm: 2.8,
    againstCurrentKm: 0.5,
    withMotorKm: 0,
    numberOfMastTilts: 0,
    numberOfLocks: 0,
    startDate: "2024-06-09T14:15:00.000Z",
    endDate: "2024-06-09T15:00:00.000Z",
    windDirection: "W",
    windForce: 3,
    precipitationInMm: 0,
    creator: 2,
  },
  {
    sectionId: 602,
    timestamp: "2024-06-09T15:05:00.000Z",
    cruiseId: 1092,
    inlandWithoutMotorKm: 2.3,
    inlandWithoutMotorOptimistKm: 0,
    oceanKm: 2.5,
    againstCurrentKm: 0.4,
    withMotorKm: 0,
    numberOfMastTilts: 0,
    numberOfLocks: 0,
    startDate: "2024-06-09T15:00:00.000Z",
    endDate: "2024-06-09T15:45:00.000Z",
    windDirection: "W",
    windForce: 3,
    precipitationInMm: 0,
    creator: 2,
  },
];

const sectionUsers: SectionUser[] = [
  { sectionId: 501, userId: 1 },
  { sectionId: 501, userId: 2 },
  { sectionId: 501, userId: 3 },
  { sectionId: 502, userId: 1 },
  { sectionId: 502, userId: 2 },
  { sectionId: 502, userId: 4 },
  { sectionId: 601, userId: 2 },
  { sectionId: 601, userId: 3 },
  { sectionId: 602, userId: 2 },
  { sectionId: 602, userId: 3 },
];

export type LogbookStore = {
  accounts: AccountProfile[];
  delegates: Delegate[];
  incomingDelegations: DelegationAccess[];
  trips: Trip[];
  cruises: CruiseEntry[];
  sections: SectionEntry[];
  sectionUsers: SectionUser[];
  tracks: GpsTrack[];
  trainingGroups: TrainingCrewGroup[];
  updateSection: (
    sectionId: number,
    payload: Partial<Omit<SectionEntry, "sectionId">>
  ) => void;
  setSectionUsers: (sectionId: number, userIds: number[]) => void;
  addAccount: (
    account: Omit<AccountProfile, "id" | "userId"> & { id?: string; userId?: number }
  ) => void;
  updateAccount: (
    id: string,
    payload: Partial<Omit<AccountProfile, "id">>
  ) => void;
  removeAccount: (id: string) => void;
  shareTripOwnership: (
    tripId: string,
    toAccountId: string,
    actorAccountId: string
  ) => void;
  transferTripOwnership: (
    tripId: string,
    toAccountId: string,
    actorAccountId: string
  ) => void;
  addTrack: (track: GpsTrack) => void;
  removeTrack: (id: string) => void;
  addDelegate: (payload: {
    accountId: string;
    canRead: boolean;
    canWrite: boolean;
  }) => void;
  updateDelegatePermissions: (
    id: string,
    permissions: { canRead?: boolean; canWrite?: boolean }
  ) => void;
  removeDelegate: (id: string) => void;
  addTrainingGroup: (payload: Omit<TrainingCrewGroup, "id"> & { id?: string }) => void;
  updateTrainingGroup: (id: string, payload: Partial<Omit<TrainingCrewGroup, "id">>) => void;
  removeTrainingGroup: (id: string) => void;
};

export const formatDurationMinutes = (minutes: number) => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hrs > 0 ? `${hrs} h ${mins} min` : `${mins} min`;
};

const logbookStore = createStore<LogbookStore>((set) => ({
  accounts: accountDirectory,
  delegates: initialDelegates,
  incomingDelegations,
  trips,
  cruises,
  sections,
  sectionUsers,
  tracks: [],
  trainingGroups,
  updateSection: (sectionId, payload) =>
    set((state) => ({
      sections: state.sections.map((section) =>
        section.sectionId === sectionId ? { ...section, ...payload } : section
      ),
    })),
  setSectionUsers: (sectionId, userIds) =>
    set((state) => {
      const uniqueUserIds = Array.from(new Set(userIds));
      const remainingUsers = state.sectionUsers.filter(
        (entry) => entry.sectionId !== sectionId
      );
      const nextUsers = uniqueUserIds.map((userId) => ({
        sectionId,
        userId,
      }));
      return { ...state, sectionUsers: [...remainingUsers, ...nextUsers] };
    }),
  addTrack: (track) =>
    set((state) => ({ tracks: [track, ...state.tracks] })),
  removeTrack: (id) =>
    set((state) => ({
      tracks: state.tracks.filter((track) => track.id !== id),
    })),
  shareTripOwnership: (tripId, toAccountId, actorAccountId) =>
    set((state) => ({
      trips: state.trips.map((trip) => {
        if (trip.id !== tripId) {
          return trip;
        }
        const alreadyShared = trip.sharedOwnerIds.includes(toAccountId);
        const logEntry: OwnershipLogEntry = {
          id:
            typeof crypto !== "undefined" && crypto.randomUUID
              ? crypto.randomUUID()
              : `own-log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: "share",
          fromAccountId: trip.ownerId,
          toAccountId,
          actorAccountId,
        };
        return {
          ...trip,
          sharedOwnerIds: alreadyShared
            ? trip.sharedOwnerIds
            : [...trip.sharedOwnerIds, toAccountId],
          ownershipLog: [logEntry, ...trip.ownershipLog],
        };
      }),
    })),
  transferTripOwnership: (tripId, toAccountId, actorAccountId) =>
    set((state) => ({
      trips: state.trips.map((trip) => {
        if (trip.id !== tripId) {
          return trip;
        }
        const logEntry: OwnershipLogEntry = {
          id:
            typeof crypto !== "undefined" && crypto.randomUUID
              ? crypto.randomUUID()
              : `own-log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: "transfer",
          fromAccountId: trip.ownerId,
          toAccountId,
          actorAccountId,
        };
        return {
          ...trip,
          ownerId: toAccountId,
          sharedOwnerIds: trip.sharedOwnerIds.filter(
            (id) => id !== toAccountId
          ),
          ownershipLog: [logEntry, ...trip.ownershipLog],
        };
      }),
    })),
  addAccount: (account) =>
    set((state) => {
      const nextUserId =
        account.userId ??
        Math.max(0, ...state.accounts.map((acc) => acc.userId)) + 1;
      const id =
        account.id ??
        (typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `account-${Date.now()}`);
      const normalizedEmail =
        account.email && account.email.trim().length > 0
          ? account.email.trim()
          : undefined;
      const trimmedBoatClass = account.defaultBoatClass.trim();
      const nextAccount: AccountProfile = {
        ...account,
        id,
        email: normalizedEmail,
        defaultBoatClass: trimmedBoatClass,
        userId: nextUserId,
      };
      return { ...state, accounts: [nextAccount, ...state.accounts] };
    }),
  updateAccount: (id, payload) =>
    set((state) => ({
      accounts: state.accounts.map((account) => {
        if (account.id !== id) {
          return account;
        }
        const normalizedEmail =
          payload.email !== undefined
            ? payload.email.trim() || undefined
            : account.email;
        const normalizedBoatClass =
          payload.defaultBoatClass !== undefined
            ? payload.defaultBoatClass.trim()
            : account.defaultBoatClass;
        return {
          ...account,
          ...payload,
          email: normalizedEmail,
          defaultBoatClass: normalizedBoatClass,
        };
      }),
    })),
  removeAccount: (id) =>
    set((state) => ({
      accounts: state.accounts.filter((account) => account.id !== id),
      delegates: state.delegates.filter(
        (delegate) => delegate.accountId !== id
      ),
    })),
  addDelegate: ({ accountId, canRead, canWrite }) =>
    set((state) => {
      const account = state.accounts.find(
        (account) => account.id === accountId
      );
      if (!account) {
        return state;
      }
      const existingIndex = state.delegates.findIndex(
        (delegate) => delegate.accountId === accountId
      );
      const delegateRecord: Delegate = {
        id:
          existingIndex >= 0
            ? state.delegates[existingIndex].id
            : `delegate-${Date.now()}`,
        accountId,
        name: account.name,
        email: account.email ?? "Keine E-Mail hinterlegt",
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
  addTrainingGroup: (payload) =>
    set((state) => {
      const id =
        payload.id ??
        (typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `tg-${Date.now()}`);
      const memberAccountIds = payload.memberAccountIds ?? [];
      const nextGroup: TrainingCrewGroup = {
        id,
        name: payload.name,
        memberAccountIds,
      };
      return { ...state, trainingGroups: [nextGroup, ...state.trainingGroups] };
    }),
  updateTrainingGroup: (id, payload) =>
    set((state) => ({
      trainingGroups: state.trainingGroups.map((group) =>
        group.id === id ? { ...group, ...payload } : group
      ),
    })),
  removeTrainingGroup: (id) =>
    set((state) => ({
      trainingGroups: state.trainingGroups.filter((group) => group.id !== id),
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

const identitySelector = <T>(state: T) => state;
const defaultEquality = Object.is;

export const useLogbookStore = <T = LogbookStore>(
  selector: (state: LogbookStore) => T = identitySelector as (
    state: LogbookStore
  ) => T,
  equalityFn: (a: T, b: T) => boolean = defaultEquality
) => {
  const selectedSlice = useSyncExternalStoreWithSelector(
    logbookStore.subscribe,
    logbookStore.getState,
    getCachedServerSnapshot,
    selector,
    equalityFn
  );

  useDebugValue(selectedSlice);

  return selectedSlice;
};

export const getLogbookState = () => logbookStore.getState();
