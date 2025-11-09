"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
import { Accordion, AccordionTab } from "primereact/accordion";
import { DISTANCE_RULES, BONUS_RULES } from "../../data/points-config";

type CrewMember = {
  name: string;
  role: string;
  isGuest: boolean;
  birthYear: number | null;
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

const crewRoleOptions = [
  { label: "Crew", value: "Crew" },
  { label: "Trainer:in", value: "Trainer" },
  { label: "Co-Skipper", value: "Co-Skipper" },
  { label: "Gast", value: "Gast" },
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
  const [trackingActive, setTrackingActive] = useState(false);
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
  });
  const [newCrewMember, setNewCrewMember] = useState<CrewMember>({
    name: "",
    role: "Crew",
    isGuest: true,
    birthYear: null,
  });

  const [activeStep, setActiveStep] = useState(0);
  const [tipsVisible, setTipsVisible] = useState(false);

  const stepItems = useMemo(
    () => [
      { label: "Basisdaten" },
      { label: "Crew & Punkte" },
      { label: "Review" },
    ],
    [],
  );

  const [trackingStats, setTrackingStats] = useState({
    distance: 0.0,
    speed: 0.0,
    duration: "00:00:00",
  });

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
            detail = `${days} Tag(e) Gemeinschaftsfahrt`;
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

  const engineRule = BONUS_RULES.find((rule) => rule.id === "engineKm");
  const enginePointsPerKm =
    typeof engineRule?.points === "number"
      ? engineRule?.points ?? 0.2
      : engineRule?.points?.perKm ?? 0.2;

  const handleAddCrewMember = () => {
    if (!newCrewMember.name.trim()) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      crewMembers: [
        ...prev.crewMembers,
        {
          ...newCrewMember,
          birthYear:
            newCrewMember.birthYear !== null
              ? Math.trunc(newCrewMember.birthYear)
              : null,
        },
      ],
    }));
    setNewCrewMember({
      name: "",
      role: "Crew",
      isGuest: true,
      birthYear: null,
    });
  };

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
            Fahrt starten
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            Neue Fahrt anlegen oder Tracking starten
          </h1>
          <p className="text-sm text-slate-500">
            Drei übersichtliche Schritte: Stammdaten erfassen, Crew & Punkte
            zuordnen, anschließend Tracking oder Speicherung starten.
          </p>
          <Link
            href="/points"
            className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-sky-600"
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
          className="!h-11 !w-11 !border-none !bg-sky-100 !text-sky-600 hover:!bg-sky-200"
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
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        startLocation: e.target.value,
                      }))
                    }
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
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        endLocation: e.target.value,
                      }))
                    }
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
              Crew & Trainingsprofile
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Gastprofile behalten ihre Daten, bis sie ein eigenes Konto
              erhalten. So bleiben Trainingsleistungen nachvollziehbar.
            </p>

            <div className="mt-4 grid gap-3 rounded-xl border border-slate-200 px-4 py-3">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="sm:col-span-2">
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
                </div>
                <Dropdown
                  value={newCrewMember.role}
                  onChange={(e) =>
                    setNewCrewMember((prev) => ({
                      ...prev,
                      role: e.value,
                    }))
                  }
                  options={crewRoleOptions}
                  placeholder="Rolle"
                  className="w-full"
                />
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
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <ToggleButton
                  checked={newCrewMember.isGuest}
                  onChange={(e) =>
                    setNewCrewMember((prev) => ({
                      ...prev,
                      isGuest: e.value,
                    }))
                  }
                  onLabel="Gastprofil"
                  offLabel="Konto verknüpft"
                  onIcon="pi pi-id-card"
                  offIcon="pi pi-user"
                  className="!border-none !bg-slate-200 !text-slate-700 sm:w-48"
                />
                <Button
                  label="Crew hinzufügen"
                  icon="pi pi-user-plus"
                  className="!w-full !rounded-full !border-none !bg-sky-600 !px-5 !py-3 !font-semibold !text-white hover:!bg-sky-700 sm:!w-auto"
                  disabled={!newCrewMember.name.trim()}
                  onClick={handleAddCrewMember}
                />
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              {formData.crewMembers.length === 0 ? (
                <p className="text-xs text-slate-500">
                  Noch keine Crew hinterlegt. Füge Trainingsmitglieder oder
                  Gäste hinzu, um ihre Fortschritte mitzutracken.
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
                              ? "Gastprofil (ohne Account)"
                              : "Account verknüpft"
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

            <div className="mt-8 border-t border-slate-200 pt-6">
              <h3 className="text-xl font-semibold text-slate-900">
                Punkteparameter
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Lege fest, wie viele Kilometer in welchen Kategorien gefahren
                wurden und welche Zusatzaktionen stattgefunden haben. Alles kann
                auch später ergänzt werden.
              </p>
              <Accordion className="mt-4">
                <AccordionTab header="Distanzkategorien">
                  <div className="flex flex-col gap-3 p-1">
                    {DISTANCE_RULES.map((rule) => (
                      <div
                        key={rule.id}
                        className="flex flex-col gap-2 rounded-xl border border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
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
                </AccordionTab>
              </Accordion>
              <Accordion className="mt-4">
                <AccordionTab header="Bonusaktionen & Engagement">
                  <div className="flex flex-col gap-4 p-1">
                    <div className="flex flex-col gap-2 rounded-xl border border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Motorfahrt (km)
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
                            Aktivieren, wenn die aktuelle Fahrt einen
                            zusammenhängenden Törn {"\u003e"} 200 km enthält.
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
                          Gemeinschaftsfahrten (Tage)
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
                </AccordionTab>
              </Accordion>
            </div>
          </Card>

          <Card className="border-none !bg-white shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">
              Sofort-Check
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Die bisher eingegebenen Kilometer und Aktionen ergeben aktuell
              <span className="font-semibold text-slate-900">
                {" "}
                {totalPoints.toFixed(1)} Punkte
              </span>
              .
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {pointsBreakdown.length === 0 ? (
                <p className="text-xs text-slate-500">
                  Noch keine Punkte erfasst. Trage Distanzen oder Aktionen ein.
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
                      <p className="text-xs text-slate-500">{item.detail}</p>
                    </div>
                    <span className="text-sm font-semibold text-slate-700">
                      {item.points.toFixed(1)}
                    </span>
                  </div>
                ))
              )}
            </div>
            <Link
              href="/points"
              className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-sky-600"
            >
              <i className="pi pi-list" aria-hidden />
              Punkte-Details anzeigen
            </Link>
          </Card>
        </div>
      ) : null}

      {activeStep === 2 ? (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card className="border-none !bg-white shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">
              Zusammenfassung & Punkte
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Verifiziere Crew, Distanzen und Zusatzaktionen. Anpassungen sind
              jederzeit möglich, auch nach der Fahrt.
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
                    Noch keine Punkte erfasst. Gehe zurück zu Schritt 2, um
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
            </div>
          </Card>

          <div className="flex flex-col gap-6">
            <Card className="border-none !bg-white shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-slate-900">
                  GPS Tracking
                </h2>
                <ToggleButton
                  checked={trackingActive}
                  onChange={(e) => {
                    setTrackingActive(e.value);
                    if (e.value) {
                      setTrackingStats({
                        distance: 0.3,
                        speed: 5.4,
                        duration: "00:04:36",
                      });
                    } else {
                      setTrackingStats({
                        distance: 0.0,
                        speed: 0.0,
                        duration: "00:00:00",
                      });
                    }
                  }}
                  onLabel="Tracking läuft"
                  offLabel="Tracking aus"
                  onIcon="pi pi-satellite"
                  offIcon="pi pi-ban"
                  className="!border-none !bg-slate-200 !text-slate-600"
                />
              </div>
              <p className="mt-2 text-sm text-slate-500">
                GPS-Verbindung wird automatisch gepuffert, wenn du offline bist.
              </p>
              <div className="mt-6 grid gap-4 rounded-xl border border-slate-200 px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Distanz</span>
                  <span className="text-lg font-semibold text-slate-900">
                    {trackingStats.distance.toFixed(1)} km
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Geschwindigkeit</span>
                  <span className="text-lg font-semibold text-slate-900">
                    {trackingStats.speed.toFixed(1)} kn
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Zeit</span>
                  <span className="text-lg font-semibold text-slate-900">
                    {trackingStats.duration}
                  </span>
                </div>
              </div>
              <Button
                label={trackingActive ? "Tracking stoppen" : "Tracking starten"}
                icon={trackingActive ? "pi pi-stop" : "pi pi-play"}
                className={`!mt-6 !w-full !rounded-full !border-none !px-5 !py-3 !font-semibold !text-white ${
                  trackingActive
                    ? "!bg-rose-500 hover:!bg-rose-600"
                    : "!bg-sky-600 hover:!bg-sky-700"
                }`}
                onClick={() => setTrackingActive((prev) => !prev)}
              />
            </Card>

            <Card className="border-none !bg-white shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">
                Touch-optimierte Aktionen
              </h2>
              <div className="mt-4 flex flex-col gap-3 text-sm text-slate-600">
                <p className="flex items-center gap-2">
                  <i className="pi pi-map-marker text-sky-500" aria-hidden />
                  Wegpunkte können direkt aus der Kartenansicht übernommen
                  werden.
                </p>
                <p className="flex items-center gap-2">
                  <i className="pi pi-cloud-download text-emerald-500" aria-hidden />
                  Offline gezeichnete Tracks werden automatisch synchronisiert.
                </p>
                <p className="flex items-center gap-2">
                  <i className="pi pi-users text-indigo-500" aria-hidden />
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
            Sobald das Gerät wieder online ist, werden Fahrten automatisch
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
            label={isLastStep ? "Speichern & Fahrt starten" : "Weiter"}
            icon={isLastStep ? "pi pi-save" : "pi pi-arrow-right"}
            iconPos={isLastStep ? "left" : "right"}
            className="!rounded-full !border-none !bg-sky-600 !px-5 !py-3 !font-semibold !text-white hover:!bg-sky-700"
            onClick={handleStepSubmit}
          />
        </div>
      </div>
    </div>
  );
}
