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
  type BonusValues,
  type CrewMember,
  type DistanceValues,
  type TripFormState,
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

const buildInitialDistances = (rules: DistanceRule[]): DistanceValues =>
  rules.reduce((acc, rule) => {
    acc[rule.id] = 0;
    return acc;
  }, {} as DistanceValues);

const initialBonusValues: BonusValues = {
  engineKm: 0,
  mastHandling: 0,
  lockCount: 0,
  longVoyageBase: false,
  longVoyageExtraHundreds: 0,
  trailerTransports: 0,
  communityDays: 0,
  youthTrainingSessions: 0,
  regattaDutyDays: 0,
};

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
    distances: buildInitialDistances(distanceRules),
    bonus: { ...initialBonusValues },
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

  const pointsBreakdown = useMemo<PointsBreakdownItem[]>(() => {
    const breakdown: PointsBreakdownItem[] = [];

    distanceRules.forEach((rule: DistanceRule) => {
      const km = formData.distances[rule.id] ?? 0;
      if (km > 0) {
        const points = Math.round(km * rule.pointsPerKm * 100) / 100;
        breakdown.push({
          id: rule.id,
          label: rule.title,
          points,
          detail: `${km} km × ${rule.pointsPerKm} Punkte`,
        });
      }
    });

    bonusRules.forEach((rule: BonusRule) => {
      const { bonus } = formData;
      let value = 0;
      let detail = "";

      switch (rule.id) {
        case "engineKm": {
          const km = bonus.engineKm;
          if (km > 0 && typeof rule.points !== "number" && rule.points.perKm) {
            value = Math.round(km * rule.points.perKm * 100) / 100;
            detail = `${km} km × ${rule.points.perKm} Punkte`;
          }
          break;
        }
        case "mastHandling": {
          const count = bonus.mastHandling;
          if (
            count > 0 &&
            typeof rule.points !== "number" &&
            rule.points.perOccurrence
          ) {
            value = count * rule.points.perOccurrence;
            detail = `${count} Vorgänge × ${rule.points.perOccurrence} Punkte`;
          }
          break;
        }
        case "lock": {
          const count = bonus.lockCount;
          if (
            count > 0 &&
            typeof rule.points !== "number" &&
            rule.points.perOccurrence
          ) {
            value = count * rule.points.perOccurrence;
            detail = `${count} Schleusen × ${rule.points.perOccurrence} Punkte`;
          }
          break;
        }
        case "longVoyageBase": {
          if (bonus.longVoyageBase && typeof rule.points === "number") {
            value = rule.points;
            detail = "Langtörn über 200 km";
          }
          break;
        }
        case "longVoyageExtra": {
          const extra = bonus.longVoyageExtraHundreds;
          if (
            extra > 0 &&
            typeof rule.points !== "number" &&
            rule.points.perOccurrence
          ) {
            value = extra * rule.points.perOccurrence;
            detail = `${extra} × zusätzliche 100 km`;
          }
          break;
        }
        case "trailerTransport": {
          const transports = bonus.trailerTransports;
          if (transports > 0 && typeof rule.points === "number") {
            value = transports * rule.points;
            detail = `${transports} Transport(e) × ${rule.points} Punkte`;
          }
          break;
        }
        case "communityEvent": {
          const days = bonus.communityDays;
          if (days > 0 && typeof rule.points === "number") {
            value = days * rule.points;
            detail = `${days} Tag(e) Gemeinschaftstörn`;
          }
          break;
        }
        case "youthTraining": {
          const sessions = bonus.youthTrainingSessions;
          if (sessions > 0 && typeof rule.points === "number") {
            value = sessions * rule.points;
            detail = `${sessions} Trainingseinheiten`;
          }
          break;
        }
        case "regattaDuty": {
          const days = bonus.regattaDutyDays;
          if (days > 0 && typeof rule.points === "number") {
            value = days * rule.points;
            detail = `${days} Regattatag(e)`;
          }
          break;
        }
        default:
          break;
      }

      if (value > 0) {
        breakdown.push({
          id: rule.id,
          label: rule.title,
          points: Math.round(value * 100) / 100,
          detail,
        });
      }
    });

    return breakdown;
  }, [bonusRules, distanceRules, formData]);

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

  const engineRule = bonusRules.find(
    (rule: BonusRule) => rule.id === "engineKm"
  );
  const enginePointsPerKm =
    typeof engineRule?.points === "number"
      ? engineRule?.points ?? 0.2
      : engineRule?.points?.perKm ?? 0.2;

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
          enginePointsPerKm={enginePointsPerKm}
          distanceRules={distanceRules}
        />
      ) : null}

      {activeStep === 3 ? (
        <ReviewStep
          formData={formData}
          pointsBreakdown={pointsBreakdown}
          totalPoints={totalPoints}
          selectedTracks={selectedTracks}
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
