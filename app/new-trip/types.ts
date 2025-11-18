import type { DistanceRule } from "../../lib/stores/points-store";

export type CrewMember = {
  name: string;
  role: string;
  isGuest: boolean;
  birthYear: number | null;
  accountId?: string | null;
};

export type DistanceValues = Record<DistanceRule["id"], number>;

export type BonusValues = {
  engineKm: number;
  mastHandling: number;
  lockCount: number;
  longVoyageBase: boolean;
  longVoyageExtraHundreds: number;
  trailerTransports: number;
  communityDays: number;
  youthTrainingSessions: number;
  regattaDutyDays: number;
};

export type TripFormState = {
  startTime: Date | null;
  endTime: Date | null;
  startLocation: string;
  endLocation: string;
  boat: string | null;
  crewMembers: CrewMember[];
  weather: string | null;
  notes: string;
  distances: DistanceValues;
  bonus: BonusValues;
  isTraining: boolean;
};

export type AutoCompleteCompleteMethodParams = {
  originalEvent: unknown;
  query: string;
};
