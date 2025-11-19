"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "primereact/card";
import { Steps } from "primereact/steps";
import {
  useLogbookStore,
  formatDurationMinutes,
  type AccountProfile,
  type GpsTrack,
  type TrainingCrewGroup,
} from "../../lib/stores/logbook-store";
import {
  usePointsStore,
  type DistanceRule,
  type BonusRule,
} from "../../lib/stores/points-store";
import {
  type AutoCompleteCompleteMethodParams,
  type CrewMember,
  type TripFormState,
  type TripSegment,
} from "./types";
import { BasicsStep } from "../../components/new-trip/BasicsStep";
import { CrewStep } from "../../components/new-trip/CrewStep";
import { PointsStep } from "../../components/new-trip/PointsStep";
import {
  ReviewStep,
  type PointsBreakdownItem,
} from "../../components/new-trip/ReviewStep";
import { TipsSidebar } from "../../components/new-trip/TipsSidebar";
import { StepFooter } from "../../components/new-trip/StepFooter";
import { NewTripHeader } from "../../components/new-trip/NewTripHeader";

const createId = (prefix: string) => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`;
};

const createInitialSegment = (
  rules: DistanceRule[],
  index = 0
): TripSegment => ({
  id: createId("segment"),
  name: `Abschnitt ${index + 1}`,
  distanceRuleId: rules[0]?.id ?? null,
  distanceKm: 0,
  bonuses: [],
});

export default function NewTripPage() {
  const router = useRouter();
  const { distanceRules, bonusRules } = usePointsStore((state) => ({
    distanceRules: state.distanceRules,
    bonusRules: state.bonusRules,
  }));
  const [formData, setFormData] = useState<TripFormState>(() => ({
    startTime: null,
    endTime: null,
    startLocation: "",
    endLocation: "",
    boat: null,
    crewMembers: [],
    weather: null,
    notes: "",
    segments: [createInitialSegment(distanceRules)],
    isTraining: false,
  }));
  const [newCrewMember, setNewCrewMember] = useState<CrewMember>({
    name: "",
    role: "Crew",
    isGuest: true,
    birthYear: null,
    accountId: null,
  });
  const [newTrainingMember, setNewTrainingMember] = useState<CrewMember>({
    name: "",
    role: "Crew",
    isGuest: false,
    birthYear: null,
    accountId: null,
  });
  const { accounts, trainingGroups, tracks } = useLogbookStore((state) => ({
    accounts: state.accounts,
    trainingGroups: state.trainingGroups,
    tracks: state.tracks,
  }));
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);
  const [hasCustomEndLocation, setHasCustomEndLocation] = useState(false);
  const [selectedTrainingGroupId, setSelectedTrainingGroupId] = useState<
    string | null
  >(null);
  const [crewSearch, setCrewSearch] = useState("");
  const [crewSuggestions, setCrewSuggestions] =
    useState<AccountProfile[]>(accounts);
  const [selectedCrewAccount, setSelectedCrewAccount] =
    useState<AccountProfile | null>(null);
  const [trainingSearch, setTrainingSearch] = useState("");
  const [trainingSuggestions, setTrainingSuggestions] =
    useState<AccountProfile[]>(accounts);
  const [selectedTrainingAccount, setSelectedTrainingAccount] =
    useState<AccountProfile | null>(null);
  useEffect(() => {
    setSelectedTrackIds((prev) =>
      prev.filter((id) => tracks.some((track: GpsTrack) => track.id === id))
    );
  }, [tracks]);

  useEffect(() => {
    if (!formData.isTraining) {
      setSelectedTrainingGroupId(null);
      setNewTrainingMember({
        name: "",
        role: "Crew",
        isGuest: false,
        birthYear: null,
        accountId: null,
      });
      setTrainingSearch("");
      setSelectedTrainingAccount(null);
      setTrainingSuggestions(accounts);
    }
  }, [formData.isTraining, accounts]);

  useEffect(() => {
    setCrewSuggestions(accounts);
    setTrainingSuggestions(accounts);
  }, [accounts]);

  const trainingGroupOptions = useMemo(
    () =>
      trainingGroups.map((group: TrainingCrewGroup) => ({
        label: `${group.name} – ${group.focus}`,
        value: group.id,
      })),
    [trainingGroups]
  );

  const [activeStep, setActiveStep] = useState(0);
  const [tipsVisible, setTipsVisible] = useState(false);

  const stepItems = useMemo(
    () => [
      { label: "Basisdaten" },
      { label: "Crew" },
      { label: "Punkte" },
      { label: "Review" },
    ],
    []
  );

  const selectedTracks = useMemo(
    () =>
      tracks.filter((track: GpsTrack) => selectedTrackIds.includes(track.id)),
    [tracks, selectedTrackIds]
  );
  const trackOptions = useMemo(
    () =>
      tracks.map((track: GpsTrack) => ({
        label: `${track.title} – ${track.distanceKm.toFixed(
          1
        )} km • ${formatDurationMinutes(track.durationMinutes)}`,
        value: track.id,
      })),
    [tracks]
  );

  const bonusRuleMap = useMemo(
    () => new Map(bonusRules.map((rule) => [rule.id, rule])),
    [bonusRules]
  );

  const pointsBreakdown = useMemo<PointsBreakdownItem[]>(() => {
    const breakdown: PointsBreakdownItem[] = [];

    distanceRules.forEach((rule: DistanceRule) => {
      const km = formData.segments
        .filter((segment) => segment.distanceRuleId === rule.id)
        .reduce((sum, segment) => sum + (segment.distanceKm || 0), 0);

      if (km > 0) {
        const points = Math.round(km * rule.pointsPerKm * 100) / 100;
        breakdown.push({
          id: `distance-${rule.id}`,
          label: rule.title,
          points,
          detail: `${km} km × ${rule.pointsPerKm} Punkte`,
        });
      }
    });

    const bonusValueTotals = new Map<BonusRule["id"], number>();
    formData.segments.forEach((segment) => {
      segment.bonuses.forEach((bonus) => {
        const rule = bonusRuleMap.get(bonus.ruleId);
        if (!rule) {
          return;
        }
        const prev = bonusValueTotals.get(bonus.ruleId) ?? 0;
        bonusValueTotals.set(bonus.ruleId, prev + (bonus.value ?? 0));
      });
    });

    bonusValueTotals.forEach((value, ruleId) => {
      if (value <= 0) {
        return;
      }
      const rule = bonusRuleMap.get(ruleId);
      if (!rule) {
        return;
      }
      if (typeof rule.points === "number") {
        const activations = value;
        const points = activations * rule.points;
        breakdown.push({
          id: `bonus-${rule.id}`,
          label: rule.title,
          points,
          detail:
            activations === 1
              ? "Einmal aktiviert"
              : `${activations}× aktiviert`,
        });
        return;
      }
      if (rule.points.perKm) {
        const points = Math.round(value * rule.points.perKm * 100) / 100;
        breakdown.push({
          id: `bonus-${rule.id}`,
          label: rule.title,
          points,
          detail: `${value} km × ${rule.points.perKm} Punkte`,
        });
        return;
      }
      if (rule.points.perOccurrence) {
        const points = value * rule.points.perOccurrence;
        breakdown.push({
          id: `bonus-${rule.id}`,
          label: rule.title,
          points,
          detail: `${value} ${rule.unitLabel} × ${rule.points.perOccurrence} Punkte`,
        });
      }
    });

    return breakdown;
  }, [bonusRuleMap, distanceRules, formData.segments]);


  const totalPoints = useMemo(
    () =>
      pointsBreakdown.reduce(
        (acc, item: PointsBreakdownItem) => acc + item.points,
        0
      ),
    [pointsBreakdown]
  );

  const isFirstStep = activeStep === 0;
  const isLastStep = activeStep === stepItems.length - 1;

  const goToNextStep = () =>
    setActiveStep((prev) => Math.min(prev + 1, stepItems.length - 1));
  const goToPreviousStep = () => setActiveStep((prev) => Math.max(prev - 1, 0));

  const handleTrainingGroupChange = (groupId: string | null) => {
    setSelectedTrainingGroupId(groupId);
    setFormData((prev) => {
      if (!groupId) {
        return { ...prev, crewMembers: [] };
      }
      const group = trainingGroups.find(
        (item: TrainingCrewGroup) => item.id === groupId
      );
      return {
        ...prev,
        crewMembers: group
          ? group.members.map(
              (member: TrainingCrewGroup["members"][number]) => ({
                ...member,
              })
            )
          : prev.crewMembers,
      };
    });
  };

  const addCrewMember = (member: CrewMember) => {
    if (!member.name.trim()) {
      return;
    }
    setFormData((prev) => ({
      ...prev,
      crewMembers: [
        ...prev.crewMembers,
        {
          ...member,
          accountId: member.accountId ?? null,
          birthYear:
            member.isGuest && member.birthYear !== null
              ? Math.trunc(member.birthYear)
              : null,
        },
      ],
    }));
  };

  const handleAddTrainingMember = () => {
    if (!canAddTrainingMember) {
      return;
    }
    const wasGuest = newTrainingMember.isGuest;
    addCrewMember(newTrainingMember);
    setNewTrainingMember({
      name: "",
      role: "Crew",
      isGuest: wasGuest,
      birthYear: null,
      accountId: null,
    });
    if (!wasGuest) {
      setTrainingSearch("");
      setSelectedTrainingAccount(null);
      setTrainingSuggestions(accounts);
    }
  };

  const handleAddCrewMemberClick = () => {
    if (!canAddCrewMember) {
      return;
    }
    const wasGuest = newCrewMember.isGuest;
    addCrewMember(newCrewMember);
    setNewCrewMember({
      name: "",
      role: "Crew",
      isGuest: wasGuest,
      birthYear: null,
      accountId: null,
    });
    if (!wasGuest) {
      setSelectedCrewAccount(null);
      setCrewSearch("");
      setCrewSuggestions(accounts);
    }
  };

  const filterAccounts = (query: string) => {
    const normalized = query.toLowerCase();
    if (!normalized) {
      return accounts;
    }
    return accounts.filter((account: AccountProfile) => {
      const lowerName = account.name.toLowerCase();
      const lowerEmail = account.email.toLowerCase();
      return lowerName.includes(normalized) || lowerEmail.includes(normalized);
    });
  };

  const handleCrewAccountSearch = (event: AutoCompleteCompleteMethodParams) => {
    const query = (event.query ?? "").trim();
    setCrewSuggestions(filterAccounts(query));
  };

  const handleTrainingAccountSearch = (
    event: AutoCompleteCompleteMethodParams
  ) => {
    const query = (event.query ?? "").trim();
    setTrainingSuggestions(filterAccounts(query));
  };

  const canAddCrewMember = newCrewMember.isGuest
    ? newCrewMember.name.trim().length > 0
    : !!selectedCrewAccount;
  const canAddTrainingMember = newTrainingMember.isGuest
    ? newTrainingMember.name.trim().length > 0
    : !!selectedTrainingAccount;

  const handleRemoveCrewMember = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      crewMembers: prev.crewMembers.filter(
        (_member, index) => index !== indexToRemove
      ),
    }));
  };

  const handleSubmit = () => {
    // TODO: Wire up with backend store later
    router.push("/trips/TR-1094");
  };

  const handleStepSubmit = () => {
    if (isLastStep) {
      handleSubmit();
    } else {
      goToNextStep();
    }
  };

  const crewSearchState = {
    query: crewSearch,
    setQuery: setCrewSearch,
    suggestions: crewSuggestions,
    setSuggestions: setCrewSuggestions,
    selectedAccount: selectedCrewAccount,
    setSelectedAccount: setSelectedCrewAccount,
  };

  const trainingSearchState = {
    query: trainingSearch,
    setQuery: setTrainingSearch,
    suggestions: trainingSuggestions,
    setSuggestions: setTrainingSuggestions,
    selectedAccount: selectedTrainingAccount,
    setSelectedAccount: setSelectedTrainingAccount,
  };

  return (
    <div className="flex flex-col gap-6">
      <NewTripHeader onOpenTips={() => setTipsVisible(true)} />

      <Card className="border-none bg-white shadow-sm">
        <Steps model={stepItems} activeIndex={activeStep} readOnly />
      </Card>

      {activeStep === 0 ? (
        <BasicsStep
          formData={formData}
          hasCustomEndLocation={hasCustomEndLocation}
          setHasCustomEndLocation={setHasCustomEndLocation}
          selectedTrackIds={selectedTrackIds}
          setSelectedTrackIds={setSelectedTrackIds}
          trackOptions={trackOptions}
          tracksAvailable={tracks.length > 0}
          onFormDataChange={setFormData}
        />
      ) : null}

      {activeStep === 1 ? (
        <CrewStep
          formData={formData}
          trainingGroupOptions={trainingGroupOptions}
          trainingGroups={trainingGroups}
          accounts={accounts}
          selectedTrainingGroupId={selectedTrainingGroupId}
          handleTrainingGroupChange={handleTrainingGroupChange}
          newTrainingMember={newTrainingMember}
          setNewTrainingMember={setNewTrainingMember}
          newCrewMember={newCrewMember}
          setNewCrewMember={setNewCrewMember}
          crewSearchState={crewSearchState}
          trainingSearchState={trainingSearchState}
          canAddCrewMember={canAddCrewMember}
          canAddTrainingMember={canAddTrainingMember}
          onAddTrainingMember={handleAddTrainingMember}
          onAddCrewMember={handleAddCrewMemberClick}
          handleCrewAccountSearch={handleCrewAccountSearch}
          handleTrainingAccountSearch={handleTrainingAccountSearch}
          handleRemoveCrewMember={handleRemoveCrewMember}
        />
      ) : null}

      {activeStep === 2 ? (
        <PointsStep
          formData={formData}
          setFormData={setFormData}
          distanceRules={distanceRules}
          bonusRules={bonusRules}
        />
      ) : null}

      {activeStep === 3 ? (
        <ReviewStep
          formData={formData}
          pointsBreakdown={pointsBreakdown}
          totalPoints={totalPoints}
          selectedTracks={selectedTracks}
          distanceRules={distanceRules}
          bonusRules={bonusRules}
        />
      ) : null}

      <TipsSidebar visible={tipsVisible} onHide={() => setTipsVisible(false)} />

      <StepFooter
        activeStep={activeStep}
        stepCount={stepItems.length}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        onPrevious={goToPreviousStep}
        onSubmitStep={handleStepSubmit}
      />
    </div>
  );
}
