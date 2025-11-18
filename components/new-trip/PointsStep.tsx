"use client";

import type { Dispatch, SetStateAction } from "react";
import { Card } from "primereact/card";
import { InputNumber } from "primereact/inputnumber";
import { Checkbox } from "primereact/checkbox";
import type { TripFormState } from "../../app/new-trip/types";
import type { DistanceRule } from "../../lib/stores/points-store";

type PointsStepProps = {
  formData: TripFormState;
  setFormData: Dispatch<SetStateAction<TripFormState>>;
  enginePointsPerKm: number;
  distanceRules: DistanceRule[];
};

export const PointsStep = ({
  formData,
  setFormData,
  enginePointsPerKm,
  distanceRules,
}: PointsStepProps) => (
  <div className="grid gap-6">
    <Card className="border-none bg-white shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-900">
        Distanzkategorien
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Verteile die gesegelten Kilometer auf die passenden Kategorien. Diese
        Angaben lassen sich jederzeit nachpflegen.
      </p>
      <div className="mt-4 flex flex-col gap-3">
        {distanceRules.map((rule) => (
          <div
            key={rule.id}
            className="flex flex-col gap-3 rounded-xl border border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {rule.title}
              </p>
              <p className="text-xs text-slate-500">{rule.description}</p>
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

    <Card className="border-none bg-white shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-900">
        Bonusaktionen & Engagement
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Erfasse zusätzliche Punkte für Motorstunden, Schleusen, Training oder
        Ehrenamt.
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
            <p className="text-sm font-semibold text-slate-900">Schleusen</p>
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
              <label htmlFor="longVoyageBase" className="text-sm text-slate-600">
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
);
