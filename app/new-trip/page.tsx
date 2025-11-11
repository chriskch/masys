"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { ToggleButton } from "primereact/togglebutton";
import { InputNumber } from "primereact/inputnumber";
import { Tag } from "primereact/tag";
import { Steps } from "primereact/steps";
import { Checkbox } from "primereact/checkbox";
import { Sidebar } from "primereact/sidebar";
import { MultiSelect } from "primereact/multiselect";
import { AutoComplete, AutoCompleteCompleteMethodParams } from "primereact/autocomplete";
import { DISTANCE_RULES, BONUS_RULES } from "../../data/points-config";
import {
  formatDurationMinutes,
  trackingStore,
} from "../../lib/tracking-store";

type CrewMember = {
  name: string;
  role: string;
  isGuest: boolean;
  birthYear: number | null;
  accountId?: string | null;
};

type DistanceValues = Record<
  (typeof DISTANCE_RULES)[number]["id"],
  number
>;

type BonusValues = {
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

type TripFormState = {
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

const boatOptions = [
  { label: "Sun Odyssey 349", value: "sun-odyssey-349" },
  { label: "Dehler 34", value: "dehler-34" },
  { label: "Hanse 388", value: "hanse-388" },
];

const weatherOptions = [
  { label: "leicht (2-3 Bft)", value: "leichter-wind" },
  { label: "mittel (4-5 Bft)", value: "mittlerer-wind" },
  { label: "stark (6+ Bft)", value: "starker-wind" },
];

type AccountProfile = {
  id: string;
  name: string;
  email: string;
  defaultRole: CrewMember["role"];
  birthYear?: number;
};

const ACCOUNT_DIRECTORY: AccountProfile[] = [
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

type TrainingCrewGroup = {
  id: string;
  name: string;
  description: string;
  focus: string;
  members: CrewMember[];
};

const TRAINING_GROUPS: TrainingCrewGroup[] = [
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

const createInitialDistances = (): DistanceValues =>
  DISTANCE_RULES.reduce(
    (acc, rule) => {
      acc[rule.id] = 0;
      return acc;
    },
    {} as DistanceValues,
  );

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
  const [formData, setFormData] = useState<TripFormState>({
    startTime: null,
    endTime: null,
    startLocation: "",
    endLocation: "",
    boat: null,
    crewMembers: [],
    weather: null,
    notes: "",
    distances: createInitialDistances(),
    bonus: { ...initialBonusValues },
    isTraining: false,
  });
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
  const recordedTracks = useSyncExternalStore(
    trackingStore.subscribe,
    trackingStore.getSnapshot,
  );
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);
  const [hasCustomEndLocation, setHasCustomEndLocation] = useState(false);
  const [selectedTrainingGroupId, setSelectedTrainingGroupId] = useState<
    string | null
  >(null);
  const [crewSearch, setCrewSearch] = useState("");
  const [crewSuggestions, setCrewSuggestions] = useState<AccountProfile[]>(ACCOUNT_DIRECTORY);
  const [selectedCrewAccount, setSelectedCrewAccount] =
    useState<AccountProfile | null>(null);
  const [trainingSearch, setTrainingSearch] = useState("");
  const [trainingSuggestions, setTrainingSuggestions] =
    useState<AccountProfile[]>(ACCOUNT_DIRECTORY);
  const [selectedTrainingAccount, setSelectedTrainingAccount] =
    useState<AccountProfile | null>(null);
  useEffect(() => {
    setSelectedTrackIds((prev) =>
      prev.filter((id) => recordedTracks.some((track) => track.id === id)),
    );
  }, [recordedTracks]);

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
      setTrainingSuggestions(ACCOUNT_DIRECTORY);
    }
  }, [formData.isTraining]);

  const trainingGroupOptions = useMemo(
    () =>
      TRAINING_GROUPS.map((group) => ({
        label: `${group.name} – ${group.focus}`,
        value: group.id,
      })),
    [],
  );

  const selectedTrainingGroup = useMemo(
    () =>
      selectedTrainingGroupId
        ? TRAINING_GROUPS.find((group) => group.id === selectedTrainingGroupId) ??
          null
        : null,
    [selectedTrainingGroupId],
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
    [],
  );

  const selectedTracks = useMemo(
    () =>
      recordedTracks.filter((track) => selectedTrackIds.includes(track.id)),
    [recordedTracks, selectedTrackIds],
  );
  const trackOptions = useMemo(
    () =>
      recordedTracks.map((track) => ({
        label: `${track.title} – ${track.distanceKm.toFixed(1)} km • ${formatDurationMinutes(track.durationMinutes)}`,
        value: track.id,
      })),
    [recordedTracks],
  );

  const pointsBreakdown = useMemo(() => {
    const breakdown: {
      id: string;
      label: string;
      points: number;
      detail: string;
    }[] = [];

    DISTANCE_RULES.forEach((rule) => {
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

    BONUS_RULES.forEach((rule) => {
      const { bonus } = formData;
      let value = 0;
      let detail = "";

      switch (rule.id) {
        case "engineKm": {
          const km = bonus.engineKm;
          if (
            km > 0 &&
            typeof rule.points !== "number" &&
            rule.points.perKm
          ) {
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
  }, [formData]);

  const totalPoints = useMemo(
    () => pointsBreakdown.reduce((acc, item) => acc + item.points, 0),
    [pointsBreakdown],
  );

  const isFirstStep = activeStep === 0;
  const isLastStep = activeStep === stepItems.length - 1;

  const goToNextStep = () =>
    setActiveStep((prev) => Math.min(prev + 1, stepItems.length - 1));
  const goToPreviousStep = () =>
    setActiveStep((prev) => Math.max(prev - 1, 0));

  const handleTrainingGroupChange = (groupId: string | null) => {
    setSelectedTrainingGroupId(groupId);
    setFormData((prev) => {
      if (!groupId) {
        return { ...prev, crewMembers: [] };
      }
      const group = TRAINING_GROUPS.find((item) => item.id === groupId);
      return {
        ...prev,
        crewMembers: group
          ? group.members.map((member) => ({ ...member }))
          : prev.crewMembers,
      };
    });
  };

  const engineRule = BONUS_RULES.find((rule) => rule.id === "engineKm");
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

  const filterAccounts = (query: string) => {
    const normalized = query.toLowerCase();
    if (!normalized) {
      return ACCOUNT_DIRECTORY;
    }
    return ACCOUNT_DIRECTORY.filter(
      (account) =>
        account.name.toLowerCase().includes(normalized) ||
        account.email.toLowerCase().includes(normalized),
    );
  };

  const handleCrewAccountSearch = (event: AutoCompleteCompleteMethodParams) => {
    const query = (event.query ?? "").trim();
    setCrewSuggestions(filterAccounts(query));
  };

  const handleTrainingAccountSearch = (
    event: AutoCompleteCompleteMethodParams,
  ) => {
    const query = (event.query ?? "").trim();
    setTrainingSuggestions(filterAccounts(query));
  };

  const accountItemTemplate = (account: AccountProfile) => (
    <div className="flex flex-col">
      <span className="text-sm font-medium text-slate-900">{account.name}</span>
      <span className="text-xs text-slate-500">{account.email}</span>
    </div>
  );

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
        (_member, index) => index !== indexToRemove,
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

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
            Törn starten
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            Neuen Törn anlegen oder Tracking starten
          </h1>
          <p className="text-sm text-slate-500">
            Vier übersichtliche Schritte: Stammdaten erfassen, Crew organisieren,
            Punkte festlegen und alles final prüfen.
          </p>
          <Link
            href="/points"
            className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)]"
          >
            <i className="pi pi-external-link" aria-hidden />
            Punkte-Regelwerk ansehen
          </Link>
        </div>
        <Button
          type="button"
          icon="pi pi-info-circle"
          rounded
          aria-label="Offline & PWA Tipps"
          className="!h-11 !w-11 !border-none !bg-[rgba(1,168,10,0.12)] !text-[var(--color-primary)] hover:!bg-[rgba(1,168,10,0.2)]"
          onClick={() => setTipsVisible(true)}
        />
      </header>

      <Card className="border-none !bg-white shadow-sm">
        <Steps model={stepItems} activeIndex={activeStep} readOnly />
      </Card>

      {activeStep === 0 ? (
        <div className="grid gap-6">
          <Card className="border-none !bg-white shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">
              Stammdaten & Zeiten
            </h2>
            <div className="mt-6 grid gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-wide text-slate-400">
                    Startzeit
                  </label>
                  <Calendar
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        startTime: e.value as Date | null,
                      }))
                    }
                    showIcon
                    showTime
                    hourFormat="24"
                    placeholder="Datum & Uhrzeit"
                    className="mt-1 w-full"
                    touchUI
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wide text-slate-400">
                    Endzeit
                  </label>
                  <Calendar
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        endTime: e.value as Date | null,
                      }))
                    }
                    showIcon
                    showTime
                    hourFormat="24"
                    placeholder="Datum & Uhrzeit"
                    className="mt-1 w-full"
                    touchUI
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-wide text-slate-400">
                    Startort
                  </label>
                  <InputText
                    value={formData.startLocation}
                    onChange={(e) => {
                      const nextValue = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        startLocation: nextValue,
                        endLocation: hasCustomEndLocation
                          ? prev.endLocation
                          : nextValue,
                      }));
                      if (!hasCustomEndLocation) {
                        setHasCustomEndLocation(false);
                      }
                    }}
                    placeholder="z. B. Cuxhaven Marina"
                    className="mt-1 w-full"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wide text-slate-400">
                    Zielort
                  </label>
                  <InputText
                    value={formData.endLocation}
                    onChange={(e) => {
                      const nextValue = e.target.value;
                      setFormData((prev) => {
                        setHasCustomEndLocation(
                          nextValue.trim() !== "" &&
                            nextValue !== prev.startLocation,
                        );
                        return {
                          ...prev,
                          endLocation: nextValue,
                        };
                      });
                    }}
                    placeholder="z. B. Helgoland"
                    className="mt-1 w-full"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-wide text-slate-400">
                    Boot
                  </label>
                  <Dropdown
                    value={formData.boat}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, boat: e.value }))
                    }
                    options={boatOptions}
                    placeholder="Boot auswählen"
                    showClear
                    className="mt-1 w-full"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wide text-slate-400">
                    Wetter
                  </label>
                  <Dropdown
                    value={formData.weather}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, weather: e.value }))
                    }
                    options={weatherOptions}
                    placeholder="Windbedingungen"
                    showClear
                    className="mt-1 w-full"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 px-4 py-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Trainingstörn
                    </p>
                    <p className="text-xs text-slate-500">
                      Aktiviere das Training, wenn du eine vorbereitete Crew
                      verwenden möchtest.
                    </p>
                  </div>
                  <ToggleButton
                    checked={formData.isTraining}
                    onChange={(e) => {
                      const nextValue = e.value as boolean;
                      setFormData((prev) => ({
                        ...prev,
                        isTraining: nextValue,
                      }));
                      if (!nextValue) {
                        setSelectedTrainingGroupId(null);
                      }
                    }}
                    onLabel="Training"
                    offLabel="Mitfahrt"
                    onIcon="pi pi-flag"
                    offIcon="pi pi-users"
                    className="!border-none !bg-slate-200 !text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wide text-slate-400">
                  GPS-Track übernehmen
                </label>
                {recordedTracks.length === 0 ? (
                  <p className="mt-1 text-xs text-slate-500">
                    Noch keine Aufzeichnungen vorhanden. Starte ein Tracking im
                    Profil, um einen Track zuzuweisen.
                  </p>
                ) : (
                  <MultiSelect
                    value={selectedTrackIds}
                    onChange={(e) =>
                      setSelectedTrackIds(
                        (e.value as string[] | undefined) ?? [],
                      )
                    }
                    options={trackOptions}
                    display="chip"
                    placeholder="Track auswählen"
                    className="mt-1 w-full"
                  />
                )}
              </div>

              <div>
                <label className="text-xs uppercase tracking-wide text-slate-400">
                  Notizen
                </label>
                <InputTextarea
                  autoResize
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  rows={4}
                  placeholder="Manöver, Besonderheiten, Race Notes …"
                  className="mt-1 w-full"
                />
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      {activeStep === 1 ? (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card className="border-none !bg-white shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">
              {formData.isTraining ? "Trainings-Crew" : "Crew & Mitfahrer"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {formData.isTraining
                ? "Wähle eine vorbereitete Trainingsgruppe oder stelle deine Crew manuell zusammen."
                : "Füge Gäste oder verknüpfte Profile hinzu, damit alle Meilen korrekt verbucht werden."}
            </p>

            <div className="mt-4 flex flex-col gap-4">
              {formData.isTraining ? (
                <>
                  <div className="rounded-xl border border-slate-200 px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Trainings-Crew auswählen
                    </p>
                    <Dropdown
                      value={selectedTrainingGroupId}
                      onChange={(e) =>
                        handleTrainingGroupChange(
                          (e.value as string | null) ?? null,
                        )
                      }
                      options={trainingGroupOptions}
                      placeholder="Trainingsgruppe wählen"
                      showClear
                      className="mt-2 w-full"
                    />
                    {selectedTrainingGroup ? (
                      <p className="mt-2 text-xs text-slate-500">
                        {selectedTrainingGroup.description}
                      </p>
                    ) : (
                      <p className="mt-2 text-xs text-slate-500">
                        Keine Gruppe gewählt – du kannst die Crew vollständig
                        manuell zusammenstellen.
                      </p>
                    )}
                  </div>
                  <div className="rounded-xl border border-slate-200 px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Weitere Trainingsprofile
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="sm:col-span-2 flex flex-col gap-2">
                        {newTrainingMember.isGuest ? (
                          <InputText
                            value={newTrainingMember.name}
                            onChange={(e) =>
                              setNewTrainingMember((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            placeholder="Name"
                            className="w-full"
                          />
                        ) : (
                          <>
                            <AutoComplete
                              value={trainingSearch}
                              suggestions={trainingSuggestions}
                              completeMethod={handleTrainingAccountSearch}
                              field="name"
                              dropdown
                              className="w-full"
                              inputClassName="w-full"
                              placeholder="Profil suchen"
                              itemTemplate={accountItemTemplate}
                              onChange={(e) => {
                                setTrainingSearch(e.value as string);
                                setSelectedTrainingAccount(null);
                                setNewTrainingMember((prev) => ({
                                  ...prev,
                                  name: "",
                                  accountId: null,
                                }));
                              }}
                              onSelect={(e) => {
                                const account = e.value as AccountProfile;
                                setSelectedTrainingAccount(account);
                                setTrainingSearch(account.name);
                                setNewTrainingMember((prev) => ({
                                  ...prev,
                                  name: account.name,
                                  role: account.defaultRole,
                                  isGuest: false,
                                  birthYear: null,
                                  accountId: account.id,
                                }));
                              }}
                            />
                            <p className="text-xs text-slate-500">
                              {selectedTrainingAccount
                                ? selectedTrainingAccount.email
                                : "Wähle ein verknüpftes Profil aus."}
                            </p>
                          </>
                        )}
                      </div>
                      {newTrainingMember.isGuest ? (
                        <div className="sm:col-span-2">
                          <InputNumber
                            value={newTrainingMember.birthYear ?? undefined}
                            onValueChange={(e) =>
                              setNewTrainingMember((prev) => ({
                                ...prev,
                                birthYear: e.value ?? null,
                              }))
                            }
                            useGrouping={false}
                            min={1980}
                            max={new Date().getFullYear()}
                            placeholder="Geburtsjahr"
                            className="w-full"
                            inputClassName="w-full"
                          />
                        </div>
                      ) : null}
                    </div>
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <ToggleButton
                        checked={newTrainingMember.isGuest}
                        onChange={(e) => {
                          const isGuest = e.value ?? false;
                          setNewTrainingMember((prev) => ({
                            ...prev,
                            isGuest,
                            name: isGuest ? prev.name : "",
                            role: prev.role || "Crew",
                            birthYear: isGuest ? prev.birthYear : null,
                            accountId: isGuest ? null : prev.accountId,
                          }));
                          if (isGuest) {
                            setSelectedTrainingAccount(null);
                            setTrainingSearch("");
                            setTrainingSuggestions(ACCOUNT_DIRECTORY);
                          } else {
                            setTrainingSearch("");
                            setSelectedTrainingAccount(null);
                          }
                        }}
                        onLabel="Gastprofil"
                        offLabel="Vereinsprofil"
                        onIcon="pi pi-id-card"
                        offIcon="pi pi-user"
                        className="!border-none !bg-slate-200 !text-slate-700 sm:w-48"
                      />
                      <Button
                        label="Profil hinzufügen"
                        icon="pi pi-user-plus"
                        className="!w-full !rounded-full !border-none !bg-[var(--color-primary)] !px-5 !py-3 !font-semibold !text-white hover:!bg-[var(--color-primary-strong)] sm:!w-auto"
                        disabled={!canAddTrainingMember}
                        onClick={() => {
                          const wasGuest = newTrainingMember.isGuest;
                          addCrewMember(newTrainingMember);
                          setNewTrainingMember({
                            name: "",
                            role: "Crew",
                            isGuest: wasGuest ? true : false,
                            birthYear: wasGuest ? null : null,
                            accountId: null,
                          });
                          if (!wasGuest) {
                            setTrainingSearch("");
                            setSelectedTrainingAccount(null);
                            setTrainingSuggestions(ACCOUNT_DIRECTORY);
                          }
                        }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-slate-200 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Mitfahrer hinzufügen
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2 flex flex-col gap-2">
                      {newCrewMember.isGuest ? (
                        <InputText
                          value={newCrewMember.name}
                          onChange={(e) =>
                            setNewCrewMember((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="Name"
                          className="w-full"
                        />
                      ) : (
                        <>
                          <AutoComplete
                            value={crewSearch}
                            suggestions={crewSuggestions}
                            completeMethod={handleCrewAccountSearch}
                            field="name"
                            dropdown
                            className="w-full"
                            inputClassName="w-full"
                            placeholder="Profil suchen"
                            itemTemplate={accountItemTemplate}
                            onChange={(e) => {
                              setCrewSearch(e.value as string);
                              setSelectedCrewAccount(null);
                              setNewCrewMember((prev) => ({
                                ...prev,
                                name: "",
                                accountId: null,
                              }));
                            }}
                            onSelect={(e) => {
                              const account = e.value as AccountProfile;
                              setSelectedCrewAccount(account);
                              setCrewSearch(account.name);
                              setNewCrewMember((prev) => ({
                                ...prev,
                                name: account.name,
                                role: account.defaultRole,
                                isGuest: false,
                                birthYear: null,
                                accountId: account.id,
                              }));
                            }}
                          />
                          <p className="text-xs text-slate-500">
                            {selectedCrewAccount
                              ? selectedCrewAccount.email
                              : "Suche nach verknüpften Konten."}
                          </p>
                        </>
                      )}
                    </div>
                    {newCrewMember.isGuest ? (
                      <div className="sm:col-span-2">
                        <InputNumber
                          value={newCrewMember.birthYear ?? undefined}
                          onValueChange={(e) =>
                            setNewCrewMember((prev) => ({
                              ...prev,
                              birthYear: e.value ?? null,
                            }))
                          }
                          useGrouping={false}
                          min={1980}
                          max={new Date().getFullYear()}
                          placeholder="Geburtsjahr"
                          className="w-full"
                          inputClassName="w-full"
                        />
                      </div>
                    ) : null}
                  </div>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <ToggleButton
                      checked={newCrewMember.isGuest}
                      onChange={(e) => {
                        const isGuest = e.value ?? false;
                        setNewCrewMember((prev) => ({
                          ...prev,
                          isGuest,
                          name: isGuest ? prev.name : "",
                          role: prev.role || "Crew",
                          birthYear: isGuest ? prev.birthYear : null,
                          accountId: isGuest ? null : prev.accountId,
                        }));
                        setSelectedCrewAccount(null);
                        setCrewSearch("");
                        setCrewSuggestions(ACCOUNT_DIRECTORY);
                      }}
                      onLabel="Gastprofil"
                      offLabel="Konto verknüpft"
                      onIcon="pi pi-id-card"
                      offIcon="pi pi-user"
                      className="!border-none !bg-slate-200 !text-slate-700 sm:w-48"
                    />
                    <Button
                      label="Mitfahrer hinzufügen"
                      icon="pi pi-user-plus"
                      className="!w-full !rounded-full !border-none !bg-[var(--color-primary)] !px-5 !py-3 !font-semibold !text-white hover:!bg-[var(--color-primary-strong)] sm:!w-auto"
                      disabled={!canAddCrewMember}
                      onClick={() => {
                        const wasGuest = newCrewMember.isGuest;
                        addCrewMember(newCrewMember);
                        setNewCrewMember({
                          name: "",
                          role: "Crew",
                          isGuest: wasGuest ? true : false,
                          birthYear: null,
                          accountId: null,
                        });
                        if (!wasGuest) {
                          setSelectedCrewAccount(null);
                          setCrewSearch("");
                          setCrewSuggestions(ACCOUNT_DIRECTORY);
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 border-t border-slate-200 pt-5">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Aktuelle Crew
              </p>
              <div className="mt-3 flex flex-col gap-2">
                {formData.crewMembers.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    Noch keine Personen hinterlegt.
                  </p>
                ) : (
                  formData.crewMembers.map((member, index) => (
                    <div
                      key={`${member.name}-${index}`}
                      className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {member.name}
                        </p>
                        <p className="text-xs text-slate-500">{member.role}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Tag
                            value={
                              member.isGuest
                                ? "Gastprofil"
                                : "Vereinsprofil"
                            }
                            severity={member.isGuest ? "info" : "success"}
                          />
                          {member.birthYear ? (
                            <Tag
                              value={`Jg. ${member.birthYear}`}
                              className="!bg-slate-200 !text-slate-700"
                            />
                          ) : null}
                        </div>
                      </div>
                      <Button
                        icon="pi pi-times"
                        className="!h-9 !w-9 !rounded-full !border-none !bg-slate-200 !text-slate-600 hover:!bg-slate-300"
                        onClick={() => handleRemoveCrewMember(index)}
                        severity="secondary"
                        aria-label={`${member.name} entfernen`}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>

          <Card className="border-none !bg-white shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">
              Touch-optimierte Aktionen
            </h2>
            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-600">
              <p className="flex items-center gap-2">
                <i
                  className="pi pi-map-marker text-[var(--color-primary-strong)]"
                  aria-hidden
                />
                Wegpunkte können direkt aus der Kartenansicht übernommen
                werden.
              </p>
              <p className="flex items-center gap-2">
                <i
                  className="pi pi-cloud-download text-[var(--color-accent-2)]"
                  aria-hidden
                />
                Offline gezeichnete Tracks werden automatisch synchronisiert.
              </p>
              <p className="flex items-center gap-2">
                <i className="pi pi-users text-[var(--color-accent-3)]" aria-hidden />
                Crew kann via QR-Code oder Link eingeladen werden.
              </p>
            </div>
          </Card>
        </div>
      ) : null}

      {activeStep === 2 ? (
        <div className="grid gap-6">
          <Card className="border-none !bg-white shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">
              Distanzkategorien
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Verteile die gesegelten Kilometer auf die passenden Kategorien.
              Diese Angaben lassen sich jederzeit nachpflegen.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {DISTANCE_RULES.map((rule) => (
                <div
                  key={rule.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {rule.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {rule.description}
                    </p>
                  </div>
                  <InputNumber
                    value={formData.distances[rule.id]}
                    onValueChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        distances: {
                          ...prev.distances,
                          [rule.id]: e.value ?? 0,
                        },
                      }))
                    }
                    min={0}
                    mode="decimal"
                    minFractionDigits={0}
                    maxFractionDigits={2}
                    placeholder="0"
                    suffix=" km"
                    className="sm:w-32"
                    inputClassName="w-full"
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card className="border-none !bg-white shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">
              Bonusaktionen & Engagement
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Erfasse zusätzliche Punkte für Motorstunden, Schleusen, Training
              oder Ehrenamt.
            </p>

            <div className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2 rounded-xl border border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Motortörn (km)
                  </p>
                  <p className="text-xs text-slate-500">
                    Wird mit {enginePointsPerKm} Punkten pro km bewertet.
                  </p>
                </div>
                <InputNumber
                  value={formData.bonus.engineKm}
                  onValueChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      bonus: {
                        ...prev.bonus,
                        engineKm: e.value ?? 0,
                      },
                    }))
                  }
                  min={0}
                  mode="decimal"
                  minFractionDigits={0}
                  maxFractionDigits={2}
                  placeholder="0"
                  suffix=" km"
                  className="sm:w-32"
                  inputClassName="w-full"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">
                    Mastlegen/Hindernisse
                  </p>
                  <InputNumber
                    value={formData.bonus.mastHandling}
                    onValueChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        bonus: {
                          ...prev.bonus,
                          mastHandling: e.value ?? 0,
                        },
                      }))
                    }
                    min={0}
                    placeholder="0"
                    className="mt-2 w-full"
                    inputClassName="w-full"
                  />
                </div>
                <div className="rounded-xl border border-slate-200 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">
                    Schleusen
                  </p>
                  <InputNumber
                    value={formData.bonus.lockCount}
                    onValueChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        bonus: {
                          ...prev.bonus,
                          lockCount: e.value ?? 0,
                        },
                      }))
                    }
                    min={0}
                    placeholder="0"
                    className="mt-2 w-full"
                    inputClassName="w-full"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 px-4 py-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Langtörn über 200 km
                    </p>
                    <p className="text-xs text-slate-500">
                      Aktivieren, wenn der aktuelle Törn einen zusammenhängenden
                      Abschnitt &gt; 200 km enthält.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      inputId="longVoyageBase"
                      checked={formData.bonus.longVoyageBase}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          bonus: {
                            ...prev.bonus,
                            longVoyageBase: e.checked ?? false,
                          },
                        }))
                      }
                    />
                    <label
                      htmlFor="longVoyageBase"
                      className="text-sm text-slate-600"
                    >
                      20 Punkte aktivieren
                    </label>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Zusätzliche 100 km
                    </p>
                    <InputNumber
                      value={formData.bonus.longVoyageExtraHundreds}
                      onValueChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          bonus: {
                            ...prev.bonus,
                            longVoyageExtraHundreds: e.value ?? 0,
                          },
                        }))
                      }
                      min={0}
                      placeholder="0"
                      className="mt-1 w-full"
                      inputClassName="w-full"
                    />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Trailertransporte
                    </p>
                    <InputNumber
                      value={formData.bonus.trailerTransports}
                      onValueChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          bonus: {
                            ...prev.bonus,
                            trailerTransports: e.value ?? 0,
                          },
                        }))
                      }
                      min={0}
                      placeholder="0"
                      className="mt-1 w-full"
                      inputClassName="w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">
                    Gemeinschaftstörns (Tage)
                  </p>
                  <InputNumber
                    value={formData.bonus.communityDays}
                    onValueChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        bonus: {
                          ...prev.bonus,
                          communityDays: e.value ?? 0,
                        },
                      }))
                    }
                    min={0}
                    placeholder="0"
                    className="mt-2 w-full"
                    inputClassName="w-full"
                  />
                </div>
                <div className="rounded-xl border border-slate-200 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">
                    Jugendtraining (Einheiten)
                  </p>
                  <InputNumber
                    value={formData.bonus.youthTrainingSessions}
                    onValueChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        bonus: {
                          ...prev.bonus,
                          youthTrainingSessions: e.value ?? 0,
                        },
                      }))
                    }
                    min={0}
                    placeholder="0"
                    className="mt-2 w-full"
                    inputClassName="w-full"
                  />
                </div>
                <div className="rounded-xl border border-slate-200 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">
                    Regatta-Funktionen (Tage)
                  </p>
                  <InputNumber
                    value={formData.bonus.regattaDutyDays}
                    onValueChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        bonus: {
                          ...prev.bonus,
                          regattaDutyDays: e.value ?? 0,
                        },
                      }))
                    }
                    min={0}
                    placeholder="0"
                    className="mt-2 w-full"
                    inputClassName="w-full"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      {activeStep === 3 ? (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card className="border-none !bg-white shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">
              Zusammenfassung & Punkte
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Verifiziere Crew, Distanzen und Zusatzaktionen. Anpassungen sind
              jederzeit möglich, auch nach dem Törn.
            </p>

            <div className="mt-4 grid gap-4">
              <div className="rounded-xl border border-slate-200 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Gesamtpunkte
                </p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {totalPoints.toFixed(1)}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {pointsBreakdown.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    Noch keine Punkte erfasst. Gehe zurück zu Schritt 3, um
                    Kategorien auszuwählen.
                  </p>
                ) : (
                  pointsBreakdown.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">
                          {item.label}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.detail}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-slate-700">
                        {item.points.toFixed(1)}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="rounded-xl border border-slate-200 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Crewübersicht
                </p>
                <div className="mt-2 flex flex-col gap-2 text-sm text-slate-600">
                  {formData.crewMembers.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      Noch keine Crew eingetragen.
                    </p>
                  ) : (
                    formData.crewMembers.map((member) => (
                      <div
                        key={`${member.name}-${member.role}`}
                        className="flex items-center justify-between"
                      >
                        <span>{member.name}</span>
                        <div className="flex items-center gap-2 text-xs">
                          <Tag value={member.role} />
                          <Tag
                            value={member.isGuest ? "Gast" : "Account"}
                            severity={member.isGuest ? "info" : "success"}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Zugeordnete GPS-Tracks
                </p>
                {selectedTracks.length === 0 ? (
                  <p className="mt-2 text-xs text-slate-500">
                    Kein GPS-Track ausgewählt.
                  </p>
                ) : (
                  <div className="mt-2 flex flex-col gap-3">
                    {selectedTracks.map((track) => (
                      <div
                        key={track.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {track.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatDurationMinutes(track.durationMinutes)} ·{" "}
                            {track.distanceKm.toFixed(1)} km ·{" "}
                            {new Date(track.startedAt).toLocaleDateString(
                              "de-DE",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          <div className="flex flex-col gap-6">
            <Card className="border-none !bg-white shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">
                Touch-optimierte Aktionen
              </h2>
              <div className="mt-4 flex flex-col gap-3 text-sm text-slate-600">
                <p className="flex items-center gap-2">
                  <i className="pi pi-map-marker text-[var(--color-primary-strong)]" aria-hidden />
                  Wegpunkte können direkt aus der Kartenansicht übernommen
                  werden.
                </p>
                <p className="flex items-center gap-2">
                  <i className="pi pi-cloud-download text-[var(--color-accent-2)]" aria-hidden />
                  Offline gezeichnete Tracks werden automatisch synchronisiert.
                </p>
                <p className="flex items-center gap-2">
                  <i className="pi pi-users text-[var(--color-accent-3)]" aria-hidden />
                  Crew kann via QR-Code oder Link eingeladen werden.
                </p>
              </div>
            </Card>
          </div>
        </div>
      ) : null}

      <Sidebar
        visible={tipsVisible}
        position="right"
        onHide={() => setTipsVisible(false)}
        header="Offline & PWA Tipps"
        className="!w-full sm:!w-96"
      >
        <div className="flex flex-col gap-4 text-sm text-slate-600">
          <p>
            MASYS speichert deine Eingaben lokal, wenn keine Verbindung besteht.
            Sobald das Gerät wieder online ist, werden Törns automatisch
            synchronisiert.
          </p>
          <div className="rounded-xl border border-slate-200 px-4 py-3">
            <p className="font-semibold text-slate-900">
              Schneller Start im Fokus
            </p>
            <p className="mt-1">
              Schritt 1 konzentriert sich auf die wichtigsten Stammdaten, damit
              du in Sekunden loslegen kannst. Weitere Details kannst du später
              ergänzen.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 px-4 py-3">
            <p className="font-semibold text-slate-900">Offline Tipps</p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>Tablet/Smartphone vor Abreise synchronisieren.</li>
              <li>GPS-Tracking läuft auch ohne Netz weiter.</li>
              <li>
                Crew kann via QR-Code oder Link hinzugefügt werden, sobald
                Verbindung verfügbar ist.
              </li>
            </ul>
          </div>
        </div>
      </Sidebar>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-slate-500">
          Schritt {activeStep + 1} von {stepItems.length}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            type="button"
            label="Zurück"
            icon="pi pi-arrow-left"
            className="!rounded-full !border-none !bg-slate-200 !px-5 !py-3 !text-slate-700 hover:!bg-slate-300"
            disabled={isFirstStep}
            onClick={goToPreviousStep}
          />
          <Button
            type="button"
            label={isLastStep ? "Speichern & Törn starten" : "Weiter"}
            icon={isLastStep ? "pi pi-save" : "pi pi-arrow-right"}
            iconPos={isLastStep ? "left" : "right"}
            className="!rounded-full !border-none !bg-[var(--color-primary)] !px-5 !py-3 !font-semibold !text-white hover:!bg-[var(--color-primary-strong)]"
            onClick={handleStepSubmit}
          />
        </div>
      </div>
    </div>
  );
}
