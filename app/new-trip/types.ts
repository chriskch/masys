import type { DistanceRule, BonusRule } from "../../lib/stores/points-store";

export type CrewMember = {
  uid: string;
  name: string;
  role: string;
  isGuest: boolean;
  birthYear: number | null;
  accountId?: string | null;
};

export type TripSegment = {
  id: string;
  name: string;
  distanceRuleId: DistanceRule["id"] | null;
  distanceKm: number;
  bonuses: SegmentBonusEntry[];
  crewMemberIds: string[];
};

export type SegmentBonusEntry = {
  id: string;
  ruleId: BonusRule["id"];
  value: number;
};

export type TripFormState = {
  startTime: Date | null;
  endTime: Date | null;
  startLocation: string;
  endLocation: string;
  boat: string | null;
  crewMembers: CrewMember[];
  lockCrewAcrossSegments: boolean;
  weather: string | null;
  notes: string;
  segments: TripSegment[];
  isTraining: boolean;
};

export type AutoCompleteCompleteMethodParams = {
  originalEvent: unknown;
  query: string;
};
