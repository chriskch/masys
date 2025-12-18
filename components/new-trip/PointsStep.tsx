"use client";

import { Dispatch, SetStateAction, useMemo } from "react";
import { Card } from "primereact/card";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { ToggleButton } from "primereact/togglebutton";
import { Tag } from "primereact/tag";
import { Checkbox } from "primereact/checkbox";
import { useState } from "react";
import { AutoComplete } from "primereact/autocomplete";
import type {
  TripFormState,
  TripSegment,
  SegmentBonusEntry,
  CrewMember,
} from "../../app/new-trip/types";
import type { DistanceRule, BonusRule } from "../../lib/stores/points-store";
import type {
  AccountProfile,
  TrainingCrewGroup,
} from "../../lib/stores/logbook-store";

type PointsStepProps = {
  formData: TripFormState;
  setFormData: Dispatch<SetStateAction<TripFormState>>;
  distanceRules: DistanceRule[];
  bonusRules: BonusRule[];
  crewMembers: CrewMember[];
  accounts: AccountProfile[];
  trainingGroups: TrainingCrewGroup[];
};

type VariableBonusPoints = Exclude<BonusRule["points"], number>;

const createId = (prefix: string) =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

const createSegmentTemplate = (
  index: number,
  defaultRuleId: DistanceRule["id"] | null,
  crewMemberIds: string[] = []
): TripSegment => ({
  id: createId("segment"),
  name: `Abschnitt ${index + 1}`,
  distanceRuleId: defaultRuleId,
  distanceKm: 0,
  bonuses: [],
  crewMemberIds,
});

const createBonusEntry = (
  ruleId: BonusRule["id"],
  isBoolean: boolean
): SegmentBonusEntry => ({
  id: createId("bonus"),
  ruleId,
  value: isBoolean ? 1 : 0,
});

const getBonusPointsConfig = (
  points: BonusRule["points"]
): VariableBonusPoints | undefined =>
  typeof points === "number" ? undefined : points;

export const SectionStep = ({
  formData,
  setFormData,
  distanceRules,
  bonusRules,
  crewMembers,
  accounts,
  trainingGroups,
}: PointsStepProps) => {
  const [newCrewName, setNewCrewName] = useState("");
  const [newCrewRole, setNewCrewRole] = useState("Crew");
  const [newCrewGuest, setNewCrewGuest] = useState(true);
  const [newCrewBirthYear, setNewCrewBirthYear] = useState<number | null>(null);
  const [accountSearch, setAccountSearch] = useState("");
  const [accountSuggestions, setAccountSuggestions] = useState(accounts);
  const [selectedAccount, setSelectedAccount] = useState<AccountProfile | null>(
    null
  );
  const accountById = useMemo(
    () => new Map(accounts.map((acc) => [acc.id, acc])),
    [accounts]
  );
  const trainingGroupOptions = useMemo(() => {
    const groups = trainingGroups ?? [];
    return groups.map((group) => ({
      label: `${group.name} (${group.memberAccountIds?.length ?? 0} Personen)`,
      value: group.id,
    }));
  }, [trainingGroups]);

  const distanceOptions = useMemo(
    () =>
      distanceRules.map((rule) => ({
        label: rule.title,
        value: rule.id,
      })),
    [distanceRules]
  );

  const bonusRuleMap = useMemo(
    () => new Map(bonusRules.map((rule) => [rule.id, rule])),
    [bonusRules]
  );

  const handleSegmentChange = (
    segmentId: string,
    updater: (segment: TripSegment) => TripSegment
  ) => {
    setFormData((prev) => ({
      ...prev,
      segments: prev.segments.map((segment) =>
        segment.id === segmentId ? updater(segment) : segment
      ),
    }));
  };

  const handleAddSegment = () => {
    setFormData((prev) => ({
      ...prev,
      segments: [
        ...prev.segments,
        createSegmentTemplate(
          prev.segments.length,
          distanceRules[0]?.id ?? null,
          prev.lockCrewAcrossSegments
            ? prev.segments[0]?.crewMemberIds ?? []
            : []
        ),
      ],
    }));
  };

  const handleRemoveSegment = (segmentId: string) => {
    setFormData((prev) => {
      if (prev.segments.length === 1) {
        return prev;
      }
      return {
        ...prev,
        segments: prev.segments.filter((segment) => segment.id !== segmentId),
      };
    });
  };

  const handleAddBonus = (segmentId: string, ruleId: BonusRule["id"]) => {
    const rule = bonusRuleMap.get(ruleId);
    if (!rule) {
      return;
    }
    handleSegmentChange(segmentId, (segment) => ({
      ...segment,
      bonuses: [
        ...segment.bonuses,
        createBonusEntry(ruleId, typeof rule.points === "number"),
      ],
    }));
  };

  const handleBonusValueChange = (
    segmentId: string,
    bonusId: string,
    nextValue: number
  ) => {
    handleSegmentChange(segmentId, (segment) => ({
      ...segment,
      bonuses: segment.bonuses.map((bonus) =>
        bonus.id === bonusId ? { ...bonus, value: nextValue } : bonus
      ),
    }));
  };

  const handleRemoveBonus = (segmentId: string, bonusId: string) => {
    handleSegmentChange(segmentId, (segment) => ({
      ...segment,
      bonuses: segment.bonuses.filter((bonus) => bonus.id !== bonusId),
    }));
  };

  const handleAddCrewInline = () => {
    if (newCrewGuest) {
      if (!newCrewName.trim()) {
        return;
      }
      if (newCrewBirthYear === null) {
        return;
      }
    } else if (!selectedAccount) {
      return;
    }
    const uid = createId("crew");
    const name = newCrewGuest
      ? newCrewName.trim()
      : selectedAccount?.name ?? "Unbekannt";
    const role = newCrewGuest
      ? newCrewRole
      : selectedAccount?.defaultRole ?? "Crew";
    setFormData((prev) => {
      const crewEntry: CrewMember = {
        uid,
        name,
        role,
        isGuest: newCrewGuest,
        birthYear: newCrewGuest
          ? newCrewBirthYear
          : selectedAccount?.birthYear ?? null,
        accountId: newCrewGuest ? null : selectedAccount?.id ?? null,
      };
      const crewIds = [...prev.crewMembers.map((c) => c.uid), uid];
      const nextSegments = prev.segments.map((segment, idx) => ({
        ...segment,
        crewMemberIds:
          prev.lockCrewAcrossSegments || idx === 0
            ? crewIds
            : segment.crewMemberIds,
      }));
      return {
        ...prev,
        crewMembers: [...prev.crewMembers, crewEntry],
        segments: nextSegments,
      };
    });
    setNewCrewName("");
    setNewCrewGuest(true);
    setNewCrewRole("Crew");
    setNewCrewBirthYear(null);
    setAccountSearch("");
    setSelectedAccount(null);
    setAccountSuggestions(accounts);
  };

  const handleRemoveCrew = (uid: string) => {
    setFormData((prev) => ({
      ...prev,
      crewMembers: prev.crewMembers.filter((member) => member.uid !== uid),
      segments: prev.segments.map((segment) => ({
        ...segment,
        crewMemberIds: segment.crewMemberIds.filter((id) => id !== uid),
      })),
    }));
  };

  const appendCrewMembers = (membersToAdd: CrewMember[]) => {
    setFormData((prev) => {
      const existing = prev.crewMembers;
      const nextCrew: CrewMember[] = [...existing];
      membersToAdd.forEach((member) => {
        const duplicate = existing.some((cm) =>
          member.accountId && cm.accountId
            ? cm.accountId === member.accountId
            : cm.name.toLowerCase() === member.name.toLowerCase()
        );
        if (!duplicate) {
          nextCrew.push(member);
        }
      });
      const crewIds = nextCrew.map((c) => c.uid);
      const nextSegments = prev.segments.map((segment, idx) => ({
        ...segment,
        crewMemberIds:
          prev.lockCrewAcrossSegments || idx === 0
            ? crewIds
            : segment.crewMemberIds.filter((id) => crewIds.includes(id)),
      }));
      return { ...prev, crewMembers: nextCrew, segments: nextSegments };
    });
  };

  const handleTrainingGroupSelect = (groupId: string | null) => {
    if (!groupId) return;
    const group = trainingGroups.find((g) => g.id === groupId);
    if (!group) return;
    const members: CrewMember[] = (group.memberAccountIds ?? [])
      .map((id) => accountById.get(id))
      .filter(Boolean)
      .map((acc) => ({
        uid: createId("crew"),
        name: acc!.name,
        role: acc!.defaultRole ?? "Crew",
        isGuest: false,
        birthYear: acc!.birthYear ?? null,
        accountId: acc!.id,
      }));
    appendCrewMembers(members);
  };

  const handleAccountSearch = (event: { query: string }) => {
    const q = (event.query ?? "").toLowerCase().trim();
    if (!q) {
      setAccountSuggestions(accounts);
      return;
    }
    setAccountSuggestions(
      accounts.filter(
        (acc) =>
          acc.name.toLowerCase().includes(q) ||
          (acc.email ?? "").toLowerCase().includes(q)
      )
    );
  };

  const handleCrewToggle = (
    segmentId: string,
    crewId: string,
    checked: boolean
  ) => {
    setFormData((prev) => {
      const applyIds = (ids: string[]) =>
        checked
          ? Array.from(new Set([...ids, crewId]))
          : ids.filter((id) => id !== crewId);
      const baseIds =
        prev.lockCrewAcrossSegments && prev.segments[0]
          ? applyIds(prev.segments[0].crewMemberIds)
          : null;

      const nextSegments = prev.segments.map((segment) => {
        if (prev.lockCrewAcrossSegments) {
          if (segment.id === prev.segments[0].id && baseIds) {
            return { ...segment, crewMemberIds: baseIds };
          }
          if (baseIds) {
            return { ...segment, crewMemberIds: baseIds };
          }
        }
        if (segment.id !== segmentId) {
          return segment;
        }
        return {
          ...segment,
          crewMemberIds: applyIds(segment.crewMemberIds),
        };
      });
      return { ...prev, segments: nextSegments };
    });
  };

  const toggleLockCrewAcrossSegments = () => {
    setFormData((prev) => {
      const nextValue = !prev.lockCrewAcrossSegments;
      const crewIds = prev.crewMembers.map((c) => c.uid);
      const nextSegments = prev.segments.map((segment, idx) => ({
        ...segment,
        crewMemberIds: nextValue || idx === 0 ? crewIds : segment.crewMemberIds,
      }));
      return {
        ...prev,
        lockCrewAcrossSegments: nextValue,
        segments: nextSegments,
      };
    });
  };

  return (
    <Card className="border-none bg-white shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Abschnitte & Punkte
          </h2>
          <p className="text-sm text-slate-500">
            Füge Abschnitte hinzu und lege fest, welche Regeln und Bonusaktionen
            dort gelten.
          </p>
        </div>
        <Button
          icon="pi pi-plus"
          label="Abschnitt hinzufügen"
          className="border-none bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white hover:bg-(--color-primary-strong)"
          onClick={handleAddSegment}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Crew erfassen
            </p>
            <p className="text-xs text-slate-500">
              Lege die Crew an, bevor du sie den Abschnitten zuordnest.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              icon={
                formData.lockCrewAcrossSegments ? "pi pi-lock" : "pi pi-unlock"
              }
              rounded
              text
              aria-label={
                formData.lockCrewAcrossSegments
                  ? "Crew für alle Abschnitte übernehmen deaktivieren"
                  : "Crew für alle Abschnitte übernehmen aktivieren"
              }
              title={
                formData.lockCrewAcrossSegments
                  ? "Crew für alle Abschnitte übernehmen"
                  : "Crew pro Abschnitt"
              }
              onClick={toggleLockCrewAcrossSegments}
              className="text-white! hover:text-(--color-primary)!"
            />
          </div>
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <Dropdown
            value={null}
            options={trainingGroupOptions}
            onChange={(e) => handleTrainingGroupSelect(e.value)}
            placeholder="Trainingsgruppe übernehmen"
            className="w-full sm:w-full"
            showClear
          />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-[3fr_1fr_1fr_auto]">
          {newCrewGuest ? (
            <div className="flex gap-2">
              <InputText
                value={newCrewName}
                onChange={(e) => setNewCrewName(e.target.value)}
                placeholder="Name"
                className="w-2/3"
              />
              <InputNumber
                value={newCrewBirthYear ?? undefined}
                onValueChange={(e) => setNewCrewBirthYear(e.value ?? null)}
                min={1940}
                max={new Date().getFullYear()}
                placeholder="Jahr"
                useGrouping={false}
                className="w-1/3"
                inputClassName="w-full"
              />
            </div>
          ) : (
            <AutoComplete
              value={accountSearch}
              suggestions={accountSuggestions}
              completeMethod={handleAccountSearch}
              field="name"
              dropdown
              onChange={(e) => {
                const next =
                  typeof e.value === "string" ? e.value : e.value?.name ?? "";
                setAccountSearch(next);
                setSelectedAccount(null);
              }}
              onSelect={(e) => {
                const account = e.value as AccountProfile;
                setSelectedAccount(account);
                setAccountSearch(account.name);
                setNewCrewRole(account.defaultRole);
              }}
              placeholder="Account suchen"
              className="w-full"
              inputClassName="w-full"
              itemTemplate={(item) => (
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-900">
                    {item.name}
                  </span>
                  <span className="text-xs text-slate-500">
                    {item.email ?? "Keine E-Mail"}
                  </span>
                </div>
              )}
            />
          )}
          <Dropdown
            value={newCrewRole}
            options={[
              { label: "Crew", value: "Crew" },
              { label: "Trainer", value: "Trainer" },
              { label: "Co-Skipper", value: "Co-Skipper" },
            ]}
            onChange={(e) => setNewCrewRole(e.value)}
            placeholder="Rolle"
            disabled={!newCrewGuest && !!selectedAccount}
          />
          <div className="flex items-center gap-2">
            <Checkbox
              inputId="newCrewGuest"
              checked={newCrewGuest}
              onChange={(e) => {
                setNewCrewGuest(e.checked ?? false);
                setNewCrewBirthYear(null);
                setAccountSearch("");
                setSelectedAccount(null);
              }}
            />
            <label htmlFor="newCrewGuest" className="text-sm text-slate-700">
              Gast
            </label>
          </div>
          <Button
            label="Crew hinzufügen"
            icon="pi pi-user-plus"
            onClick={handleAddCrewInline}
            disabled={
              newCrewGuest
                ? !newCrewName.trim() || newCrewBirthYear === null
                : !selectedAccount
            }
          />
        </div>
        {selectedAccount ? (
          <p className="mt-2 text-xs text-slate-500">
            Ausgewählt: {selectedAccount.name} · {selectedAccount.defaultRole}
          </p>
        ) : !newCrewGuest ? (
          <p className="mt-2 text-xs text-slate-500">
            Suche eine:n vorhandene:n Nutzer:in, wenn kein Gast.
          </p>
        ) : null}
        {crewMembers.length > 0 ? (
          <div className="mt-3 flex flex-col gap-2">
            {crewMembers.map((member) => (
              <div
                key={member.uid}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm text-slate-700"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{member.name}</span>
                  <Tag value={member.role} className="text-xs" />
                  <Tag
                    value={member.isGuest ? "Gast" : "Account"}
                    severity={member.isGuest ? "info" : "success"}
                    className="text-xs"
                  />
                </div>
                <Button
                  icon="pi pi-trash"
                  rounded
                  text
                  severity="danger"
                  aria-label={`${member.name} entfernen`}
                  onClick={() => handleRemoveCrew(member.uid)}
                  className="text-white! hover:text-(--color-primary)!"
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-xs text-slate-500">
            Noch keine Crew angelegt. Füge mindestens eine Person hinzu.
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-5">
        {formData.segments.map((segment, index) => {
          const availableBonusOptions = bonusRules
            .filter(
              (rule) =>
                !segment.bonuses.some((bonus) => bonus.ruleId === rule.id)
            )
            .map((rule) => ({ label: rule.title, value: rule.id }));

          return (
            <div
              key={segment.id}
              className="rounded-2xl border border-slate-200 p-4 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 flex-col gap-2 sm:pr-4">
                  <label className="text-xs uppercase tracking-wide text-slate-400">
                    Abschnittsname
                  </label>
                  <InputText
                    value={segment.name}
                    onChange={(e) =>
                      handleSegmentChange(segment.id, (current) => ({
                        ...current,
                        name: e.target.value,
                      }))
                    }
                    placeholder={`Abschnitt ${index + 1}`}
                    className="w-full"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  <label className="text-xs uppercase tracking-wide text-slate-400">
                    Gewässertyp
                  </label>
                  <Dropdown
                    value={segment.distanceRuleId}
                    options={distanceOptions}
                    onChange={(e) =>
                      handleSegmentChange(segment.id, (current) => ({
                        ...current,
                        distanceRuleId: e.value ?? null,
                      }))
                    }
                    placeholder="Kategorie wählen"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-wide text-slate-400">
                    Distanz (km)
                  </label>
                  <InputNumber
                    value={segment.distanceKm}
                    onValueChange={(e) =>
                      handleSegmentChange(segment.id, (current) => ({
                        ...current,
                        distanceKm: e.value ?? 0,
                      }))
                    }
                    min={0}
                    mode="decimal"
                    minFractionDigits={0}
                    maxFractionDigits={2}
                    placeholder="0"
                    suffix=" km"
                    className="mt-1 w-full"
                    inputClassName="w-full"
                  />
                </div>
                {formData.segments.length > 1 && (
                  <div className="flex items-end justify-end">
                    <Button
                      icon="pi pi-trash"
                      className="delete-icon-button"
                      rounded
                      aria-label={`Abschnitt ${index + 1} entfernen`}
                      onClick={() => handleRemoveSegment(segment.id)}
                    />
                  </div>
                )}
              </div>

              <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Crew in diesem Abschnitt
                    </p>
                    {formData.lockCrewAcrossSegments && index > 0 ? (
                      <p className="text-xs text-slate-500">
                        Crew wurde aus Abschnitt 1 übernommen (Lock aktiv).
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500">
                        Wähle, wer in diesem Abschnitt an Bord ist.
                      </p>
                    )}
                  </div>
                  {formData.lockCrewAcrossSegments && (
                    <Tag
                      value={index === 0 ? "Lock aktiv" : "Gesperrt"}
                      severity="info"
                      className="border-none! text-xs"
                    />
                  )}
                </div>
                {formData.lockCrewAcrossSegments && index > 0 ? null : (
                  <div className="mt-3 flex flex-col gap-2">
                    {crewMembers.length === 0 ? (
                      <p className="text-xs text-slate-500">
                        Noch keine Crew im vorherigen Schritt angelegt.
                      </p>
                    ) : (
                      crewMembers.map((member) => (
                        <label
                          key={member.uid}
                          className="flex items-center gap-2 text-sm text-slate-700"
                        >
                          <Checkbox
                            checked={segment.crewMemberIds.includes(member.uid)}
                            onChange={(e) =>
                              handleCrewToggle(
                                segment.id,
                                member.uid,
                                e.checked ?? false
                              )
                            }
                            disabled={formData.lockCrewAcrossSegments}
                          />
                          <span className="font-medium">{member.name}</span>
                          <span className="text-xs text-slate-500">
                            {member.role}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-semibold text-slate-900">
                    Bonusaktionen & Engagement
                  </p>
                  <Dropdown
                    value={null}
                    options={availableBonusOptions}
                    onChange={(e) =>
                      e.value &&
                      handleAddBonus(segment.id, e.value as BonusRule["id"])
                    }
                    placeholder={
                      availableBonusOptions.length === 0
                        ? "Alle Regeln hinzugefügt"
                        : "Bonus hinzufügen"
                    }
                    className="w-full sm:w-64"
                    disabled={availableBonusOptions.length === 0}
                  />
                </div>

                {segment.bonuses.length === 0 ? (
                  <p className="mt-3 text-xs text-slate-500">
                    Noch keine Bonusaktionen für diesen Abschnitt ausgewählt.
                  </p>
                ) : (
                  <div className="mt-3 flex flex-col gap-3">
                    {segment.bonuses.map((bonus) => {
                      const rule = bonusRuleMap.get(bonus.ruleId);
                      if (!rule) {
                        return null;
                      }
                      const pointsConfig = getBonusPointsConfig(rule.points);
                      const isBoolean = !pointsConfig;
                      const isPerKm = !!pointsConfig?.perKm;
                      const unitLabel = isBoolean
                        ? ""
                        : isPerKm
                        ? "km"
                        : rule.unitLabel;

                      return (
                        <div
                          key={bonus.id}
                          className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {rule.title}
                            </p>
                            <p className="text-xs text-slate-500">
                              {rule.description}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
                            {isBoolean ? (
                              <ToggleButton
                                checked={bonus.value > 0}
                                onChange={(e) =>
                                  handleBonusValueChange(
                                    segment.id,
                                    bonus.id,
                                    e.value ? 1 : 0
                                  )
                                }
                                onLabel="Aktiv"
                                offLabel="Inaktiv"
                                className="border-none bg-slate-200 text-slate-700"
                              />
                            ) : (
                              <InputNumber
                                value={bonus.value}
                                onValueChange={(e) =>
                                  handleBonusValueChange(
                                    segment.id,
                                    bonus.id,
                                    e.value ?? 0
                                  )
                                }
                                min={0}
                                mode="decimal"
                                minFractionDigits={0}
                                maxFractionDigits={isPerKm ? 2 : 0}
                                placeholder="0"
                                suffix={` ${unitLabel}`}
                                className="sm:w-40"
                                inputClassName="w-full"
                              />
                            )}
                            <Button
                              icon="pi pi-times"
                              rounded
                              text
                              severity="secondary"
                              aria-label="Bonus entfernen"
                              className="text-slate-400 hover:text-rose-500"
                              onClick={() =>
                                handleRemoveBonus(segment.id, bonus.id)
                              }
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
