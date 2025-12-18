import { useEffect, useMemo, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { MultiSelect } from "primereact/multiselect";
import type { SectionEntry, AccountProfile } from "@/lib/stores/logbook-store";

type SectionEditDialogProps = {
  open: boolean;
  sectionEntry: SectionEntry;
  sectionIndex: number;
  crewUserIds: number[];
  accounts: AccountProfile[];
  onClose: () => void;
  onSave: (payload: {
    updates: Partial<Omit<SectionEntry, "sectionId">>;
    crewUserIds: number[];
  }) => void;
};

type SectionFormState = {
  startDate: Date | null;
  endDate: Date | null;
  oceanKm: number;
  againstCurrentKm: number;
  inlandWithoutMotorKm: number;
  inlandWithoutMotorOptimistKm: number;
  withMotorKm: number;
  numberOfLocks: number;
  windDirection: string;
  windForce: number;
  precipitationInMm: number;
  crewUserIds: number[];
};

const createSectionFormState = (
  sectionEntry: SectionEntry,
  crewUserIds: number[]
): SectionFormState => ({
  startDate: sectionEntry.startDate ? new Date(sectionEntry.startDate) : null,
  endDate: sectionEntry.endDate ? new Date(sectionEntry.endDate) : null,
  oceanKm: sectionEntry.oceanKm,
  againstCurrentKm: sectionEntry.againstCurrentKm,
  inlandWithoutMotorKm: sectionEntry.inlandWithoutMotorKm,
  inlandWithoutMotorOptimistKm: sectionEntry.inlandWithoutMotorOptimistKm,
  withMotorKm: sectionEntry.withMotorKm,
  numberOfLocks: sectionEntry.numberOfLocks,
  windDirection: sectionEntry.windDirection ?? "-",
  windForce: sectionEntry.windForce ?? 0,
  precipitationInMm: sectionEntry.precipitationInMm ?? 0,
  crewUserIds,
});

export function SectionEditDialog({
  open,
  sectionEntry,
  sectionIndex,
  crewUserIds,
  accounts,
  onClose,
  onSave,
}: SectionEditDialogProps) {
  const [formState, setFormState] = useState<SectionFormState>(() =>
    createSectionFormState(sectionEntry, crewUserIds)
  );

  useEffect(() => {
    if (!open) return;
    setFormState(createSectionFormState(sectionEntry, crewUserIds));
  }, [open, sectionEntry, crewUserIds]);

  const accountOptions = useMemo(
    () =>
      accounts.map((account) => ({
        label: account.name,
        value: account.userId,
      })),
    [accounts]
  );

  const handleSave = () => {
    const updates: Partial<Omit<SectionEntry, "sectionId">> = {
      startDate: formState.startDate
        ? formState.startDate.toISOString()
        : sectionEntry.startDate,
      endDate: formState.endDate
        ? formState.endDate.toISOString()
        : sectionEntry.endDate,
      oceanKm: formState.oceanKm,
      againstCurrentKm: formState.againstCurrentKm,
      inlandWithoutMotorKm: formState.inlandWithoutMotorKm,
      inlandWithoutMotorOptimistKm: formState.inlandWithoutMotorOptimistKm,
      withMotorKm: formState.withMotorKm,
      numberOfLocks: formState.numberOfLocks,
      windDirection: formState.windDirection.trim() || "-",
      windForce: formState.windForce,
      precipitationInMm: formState.precipitationInMm,
    };

    onSave({ updates, crewUserIds: formState.crewUserIds });
  };

  return (
    <Dialog
      header={`Abschnitt ${sectionIndex + 1} bearbeiten`}
      visible={open}
      onHide={onClose}
      className="w-full sm:w-3/4 lg:w-2/3"
      breakpoints={{ "960px": "90vw", "640px": "96vw" }}
    >
      <div className="flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wide text-slate-400">
              Start
            </label>
            <Calendar
              value={formState.startDate}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, startDate: e.value ?? null }))
              }
              showTime
              hourFormat="24"
              className="w-full"
              inputClassName="w-full"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wide text-slate-400">
              Ende
            </label>
            <Calendar
              value={formState.endDate}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, endDate: e.value ?? null }))
              }
              showTime
              hourFormat="24"
              className="w-full"
              inputClassName="w-full"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wide text-slate-400">
              Segeln See (km)
            </label>
            <InputNumber
              value={formState.oceanKm}
              onValueChange={(e) =>
                setFormState((prev) => ({ ...prev, oceanKm: e.value ?? 0 }))
              }
              min={0}
              maxFractionDigits={2}
              className="w-full"
              inputClassName="w-full"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wide text-slate-400">
              Gegenstrom (km)
            </label>
            <InputNumber
              value={formState.againstCurrentKm}
              onValueChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  againstCurrentKm: e.value ?? 0,
                }))
              }
              min={0}
              maxFractionDigits={2}
              className="w-full"
              inputClassName="w-full"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wide text-slate-400">
              Segeln Binnen (km)
            </label>
            <InputNumber
              value={formState.inlandWithoutMotorKm}
              onValueChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  inlandWithoutMotorKm: e.value ?? 0,
                }))
              }
              min={0}
              maxFractionDigits={2}
              className="w-full"
              inputClassName="w-full"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wide text-slate-400">
              Segeln Opti (km)
            </label>
            <InputNumber
              value={formState.inlandWithoutMotorOptimistKm}
              onValueChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  inlandWithoutMotorOptimistKm: e.value ?? 0,
                }))
              }
              min={0}
              maxFractionDigits={2}
              className="w-full"
              inputClassName="w-full"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wide text-slate-400">
              Motor (km)
            </label>
            <InputNumber
              value={formState.withMotorKm}
              onValueChange={(e) =>
                setFormState((prev) => ({ ...prev, withMotorKm: e.value ?? 0 }))
              }
              min={0}
              maxFractionDigits={2}
              className="w-full"
              inputClassName="w-full"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wide text-slate-400">
              Schleusen
            </label>
            <InputNumber
              value={formState.numberOfLocks}
              onValueChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  numberOfLocks: e.value ?? 0,
                }))
              }
              min={0}
              maxFractionDigits={0}
              className="w-full"
              inputClassName="w-full"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wide text-slate-400">
              Windrichtung
            </label>
            <InputText
              value={formState.windDirection}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  windDirection: e.target.value,
                }))
              }
              placeholder="z. B. NO"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wide text-slate-400">
              Windstärke (Bft)
            </label>
            <InputNumber
              value={formState.windForce}
              onValueChange={(e) =>
                setFormState((prev) => ({ ...prev, windForce: e.value ?? 0 }))
              }
              min={0}
              max={12}
              maxFractionDigits={0}
              className="w-full"
              inputClassName="w-full"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wide text-slate-400">
              Niederschlag (mm)
            </label>
            <InputNumber
              value={formState.precipitationInMm}
              onValueChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  precipitationInMm: e.value ?? 0,
                }))
              }
              min={0}
              maxFractionDigits={1}
              className="w-full"
              inputClassName="w-full"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wide text-slate-400">
              Crew
            </label>
            <MultiSelect
              value={formState.crewUserIds}
              options={accountOptions}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  crewUserIds: e.value ?? [],
                }))
              }
              placeholder="Crew auswählen"
              display="chip"
              filter
              showClear
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button
          label="Abbrechen"
          severity="secondary"
          outlined
          onClick={onClose}
        />
        <Button label="Speichern" icon="pi pi-save" onClick={handleSave} />
      </div>
    </Dialog>
  );
}
