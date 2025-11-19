"use client";

import { Dispatch, SetStateAction, useMemo } from "react";
import { Card } from "primereact/card";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { ToggleButton } from "primereact/togglebutton";
import type {
  TripFormState,
  TripSegment,
  SegmentBonusEntry,
} from "../../app/new-trip/types";
import type { DistanceRule, BonusRule } from "../../lib/stores/points-store";

type PointsStepProps = {
  formData: TripFormState;
  setFormData: Dispatch<SetStateAction<TripFormState>>;
  distanceRules: DistanceRule[];
  bonusRules: BonusRule[];
};

const createId = (prefix: string) =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

const createSegmentTemplate = (
  index: number,
  defaultRuleId: DistanceRule["id"] | null
): TripSegment => ({
  id: createId("segment"),
  name: `Abschnitt ${index + 1}`,
  distanceRuleId: defaultRuleId,
  distanceKm: 0,
  bonuses: [],
});

const createBonusEntry = (ruleId: BonusRule["id"], isBoolean: boolean): SegmentBonusEntry => ({
  id: createId("bonus"),
  ruleId,
  value: isBoolean ? 1 : 0,
});

export const PointsStep = ({
  formData,
  setFormData,
  distanceRules,
  bonusRules,
}: PointsStepProps) => {
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
        createSegmentTemplate(prev.segments.length, distanceRules[0]?.id ?? null),
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

  return (
    <Card className="border-none bg-white shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Abschnitte & Punkte</h2>
          <p className="text-sm text-slate-500">
            Füge Abschnitte hinzu und lege fest, welche Regeln und Bonusaktionen dort gelten.
          </p>
        </div>
        <Button
          icon="pi pi-plus"
          label="Abschnitt hinzufügen"
          className="border-none bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white hover:bg-(--color-primary-strong)"
          onClick={handleAddSegment}
        />
      </div>

      <div className="mt-6 flex flex-col gap-5">
        {formData.segments.map((segment, index) => {
          const availableBonusOptions = bonusRules
            .filter((rule) => !segment.bonuses.some((bonus) => bonus.ruleId === rule.id))
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

              <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-semibold text-slate-900">
                    Bonusaktionen & Engagement
                  </p>
                  <Dropdown
                    value={null}
                    options={availableBonusOptions}
                    onChange={(e) =>
                      e.value && handleAddBonus(segment.id, e.value as BonusRule["id"])
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
                      const isBoolean = typeof rule.points === "number";
                      const isPerKm = !isBoolean && !!rule.points.perKm;
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
                              onClick={() => handleRemoveBonus(segment.id, bonus.id)}
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
