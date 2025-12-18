"use client";

import { create } from "zustand";
import {
  getLogbookState,
  type CruiseEntry,
  type SectionEntry,
  type SectionUser,
} from "./logbook-store";
import { buildPersonFromName, type Person } from "./user-store";

export type TripAttributes = {
  isGroup: boolean;
  isTraining: boolean;
  isRegatta: boolean;
};

export type TripSection = {
  abschnittId: number;
  start: string;
  ende: string;
  sailSeaKm: number;
  sailInlandKm: number;
  motorKm: number;
  schleusen: number;
  windDirection: string;
  windSpeed: number;
  precipitation: number;
  crew: Person[];
};

export type TripHistoryEntry = {
  timestamp: string;
  action: string;
  user: string;
};

export type Trip = {
  id: string;
  titel: string;
  startDate: string;
  endDate: string;
  startLocation: string;
  endLocation: string;
  totalPoints: number;
  attributes: TripAttributes;
  ownerId: string | null;
  sharedOwnerIds: string[];
  sections: TripSection[];
  history: TripHistoryEntry[];
};

type TripStoreState = {
  currentTrip: Trip | null;
  isLoading: boolean;
  fetchTrip: (tripId: string) => Promise<void>;
};

const toTripHistory = (
  ownershipLog: NonNullable<
    ReturnType<typeof getLogbookState>["trips"][number]["ownershipLog"]
  >,
  accountLookup: Map<string, string>
): TripHistoryEntry[] =>
  ownershipLog.map((entry) => ({
    timestamp: entry.timestamp,
    action:
      entry.action === "transfer"
        ? `Ownership an ${accountLookup.get(entry.toAccountId) ?? entry.toAccountId} übertragen`
        : `Ownership mit ${accountLookup.get(entry.toAccountId) ?? entry.toAccountId} geteilt`,
    user: accountLookup.get(entry.actorAccountId) ?? "Unbekannt",
  }));

const buildTripFromCruise = (
  cruise: CruiseEntry,
  sectionEntries: SectionEntry[],
  sectionUsers: SectionUser[],
  accountLookup: Map<string, string>,
  accountByUserId: Map<number, { name: string; role: string; email?: string }>,
  history: TripHistoryEntry[],
  tripMeta?: { ownerId: string; sharedOwnerIds: string[] }
): Trip => {
  const sections: TripSection[] = sectionEntries.map((section) => {
    const crew = sectionUsers
      .filter((su) => su.sectionId === section.sectionId)
      .map((su) => {
        const account = accountByUserId.get(su.userId);
        const name = account?.name ?? `User ${su.userId}`;
        return buildPersonFromName(
          su.userId,
          name,
          account?.role ?? "Crew",
          account?.email
        );
      });

    return {
      abschnittId: section.sectionId,
      start: section.startDate,
      ende: section.endDate,
      sailSeaKm: section.oceanKm + section.againstCurrentKm,
      sailInlandKm:
        section.inlandWithoutMotorKm + section.inlandWithoutMotorOptimistKm,
      motorKm: section.withMotorKm,
      schleusen: section.numberOfLocks,
      windDirection: section.windDirection ?? "-",
      windSpeed: section.windForce ?? 0,
      precipitation: section.precipitationInMm ?? 0,
      crew,
    };
  });

  const firstSection = sections[0];
  const startDate = firstSection?.start ?? cruise.startDate;
  const endDate = sections[sections.length - 1]?.ende ?? cruise.endDate;

  return {
    id: cruise.tripId,
    titel: cruise.destination
      ? `Törn nach ${cruise.destination}`
      : `Törn ${cruise.tripId}`,
    startDate,
    endDate,
    startLocation: cruise.start ?? "Unbekannt",
    endLocation: cruise.destination ?? "Offen",
    totalPoints: cruise.score,
    attributes: {
      isGroup: cruise.groupCruise,
      isTraining: cruise.trainingCruise,
      isRegatta: cruise.regatta,
    },
    ownerId: tripMeta?.ownerId ?? null,
    sharedOwnerIds: tripMeta?.sharedOwnerIds ?? [],
    sections,
    history,
  };
};

const buildMockTrip = (tripId: string): Trip => ({
  id: tripId,
  titel: `Mock-Törn ${tripId}`,
  startDate: new Date().toISOString(),
  endDate: new Date().toISOString(),
  startLocation: "Unbekannter Hafen",
  endLocation: "Ziel folgt",
  totalPoints: 0,
  attributes: { isGroup: false, isTraining: false, isRegatta: false },
  ownerId: null,
  sharedOwnerIds: [],
  sections: [],
  history: [],
});

export const useTripStore = create<TripStoreState>((set) => ({
  currentTrip: null,
  isLoading: false,
  fetchTrip: async (tripId: string) => {
    set({ isLoading: true });
    try {
      const state = getLogbookState();
      const tripMeta = state.trips.find((t) => t.id === tripId);
      const cruise =
        state.cruises.find((c) => c.tripId === tripId) ??
        state.cruises.find((c) => `TR-${c.cruiseId}` === tripId);
      const sections = cruise
        ? state.sections.filter((section) => section.cruiseId === cruise.cruiseId)
        : [];
      const accountLookup = new Map(
        state.accounts.map((acc) => [acc.id, acc.name])
      );
      const accountByUserId = new Map(
        state.accounts.map((acc) => [
          acc.userId,
          { name: acc.name, role: acc.defaultRole, email: acc.email },
        ])
      );

      const ownershipLog =
        state.trips.find((t) => t.id === tripId)?.ownershipLog ?? [];
      const history = toTripHistory(ownershipLog, accountLookup);

      const trip = cruise
        ? buildTripFromCruise(
            cruise,
            sections,
            state.sectionUsers,
            accountLookup,
            accountByUserId,
            history,
            tripMeta
          )
        : buildMockTrip(tripId);

      set({ currentTrip: trip, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));
