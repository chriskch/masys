"use client";

import { useCallback, type Dispatch, type SetStateAction } from "react";
import { Card } from "primereact/card";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { ToggleButton } from "primereact/togglebutton";
import { MultiSelect } from "primereact/multiselect";
import type { TripFormState } from "../../app/new-trip/types";
import { useTripOptionsStore } from "../../lib/stores/trip-options-store";

type BasicsStepProps = {
  formData: TripFormState;
  hasCustomEndLocation: boolean;
  setHasCustomEndLocation: (value: boolean) => void;
  selectedTrackIds: string[];
  setSelectedTrackIds: Dispatch<SetStateAction<string[]>>;
  trackOptions: { label: string; value: string }[];
  tracksAvailable: boolean;
  onFormDataChange: Dispatch<SetStateAction<TripFormState>>;
};

export const BasicsStep = ({
  formData,
  hasCustomEndLocation,
  setHasCustomEndLocation,
  selectedTrackIds,
  setSelectedTrackIds,
  trackOptions,
  tracksAvailable,
  onFormDataChange,
}: BasicsStepProps) => {
  const { boatOptions, weatherOptions } = useTripOptionsStore((state) => ({
    boatOptions: state.boatOptions,
    weatherOptions: state.weatherOptions,
  }));
  const handleStartLocationChange = useCallback(
    (nextValue: string) => {
      onFormDataChange((prev) => ({
        ...prev,
        startLocation: nextValue,
        endLocation: hasCustomEndLocation ? prev.endLocation : nextValue,
      }));
      if (!hasCustomEndLocation) {
        setHasCustomEndLocation(false);
      }
    },
    [hasCustomEndLocation, onFormDataChange, setHasCustomEndLocation],
  );

  const handleEndLocationChange = useCallback(
    (nextValue: string) => {
      setHasCustomEndLocation(
        nextValue.trim() !== "" && nextValue !== formData.startLocation,
      );
      onFormDataChange((prev) => ({
        ...prev,
        endLocation: nextValue,
      }));
    },
    [formData.startLocation, onFormDataChange, setHasCustomEndLocation],
  );

  return (
    <div className="grid gap-6">
      <Card className="border-none bg-white shadow-sm">
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
                  onFormDataChange((prev) => ({
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
                  onFormDataChange((prev) => ({
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
                onChange={(e) => handleStartLocationChange(e.target.value)}
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
                onChange={(e) => handleEndLocationChange(e.target.value)}
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
                  onFormDataChange((prev) => ({ ...prev, boat: e.value }))
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
                  onFormDataChange((prev) => ({ ...prev, weather: e.value }))
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
                onChange={(e) =>
                  onFormDataChange((prev) => ({
                    ...prev,
                    isTraining: e.value as boolean,
                  }))
                }
                onLabel="Training"
                offLabel="Mitfahrt"
                onIcon="pi pi-flag"
                offIcon="pi pi-users"
                className="border-none bg-slate-200 text-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide text-slate-400">
              GPS-Track übernehmen
            </label>
            {!tracksAvailable ? (
              <p className="mt-1 text-xs text-slate-500">
                Noch keine Aufzeichnungen vorhanden. Starte ein Tracking im
                Profil, um einen Track zuzuweisen.
              </p>
            ) : (
              <MultiSelect
                value={selectedTrackIds}
                onChange={(e) =>
                  setSelectedTrackIds((e.value as string[] | undefined) ?? [])
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
                onFormDataChange((prev) => ({
                  ...prev,
                  notes: e.target.value,
                }))
              }
              rows={4}
              placeholder="Manöver, Besonderheiten, Race Notes …"
              className="mt-1 w-full"
            />
          </div>
        </div>
      </Card>
    </div>
  );
};
