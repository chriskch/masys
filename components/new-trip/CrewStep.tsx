"use client";

import type { Dispatch, SetStateAction } from "react";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { ToggleButton } from "primereact/togglebutton";
import { AutoComplete } from "primereact/autocomplete";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import type {
  TripFormState,
  CrewMember,
  AutoCompleteCompleteMethodParams,
} from "../../app/new-trip/types";
import type {
  AccountProfile,
  TrainingCrewGroup,
} from "../../lib/stores/logbook-store";

type AccountSearchState = {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  suggestions: AccountProfile[];
  setSuggestions: Dispatch<SetStateAction<AccountProfile[]>>;
  selectedAccount: AccountProfile | null;
  setSelectedAccount: Dispatch<SetStateAction<AccountProfile | null>>;
};

type CrewStepProps = {
  formData: TripFormState;
  trainingGroupOptions: { label: string; value: string }[];
  trainingGroups: TrainingCrewGroup[];
  accounts: AccountProfile[];
  selectedTrainingGroupId: string | null;
  handleTrainingGroupChange: (groupId: string | null) => void;
  newTrainingMember: CrewMember;
  setNewTrainingMember: Dispatch<SetStateAction<CrewMember>>;
  newCrewMember: CrewMember;
  setNewCrewMember: Dispatch<SetStateAction<CrewMember>>;
  crewSearchState: AccountSearchState;
  trainingSearchState: AccountSearchState;
  canAddCrewMember: boolean;
  canAddTrainingMember: boolean;
  onAddTrainingMember: () => void;
  onAddCrewMember: () => void;
  handleCrewAccountSearch: (
    params: AutoCompleteCompleteMethodParams,
  ) => void;
  handleTrainingAccountSearch: (
    params: AutoCompleteCompleteMethodParams,
  ) => void;
  handleRemoveCrewMember: (index: number) => void;
};

const accountItemTemplate = (account: AccountProfile) => (
  <div className="flex flex-col">
    <span className="text-sm font-medium text-slate-900">{account.name}</span>
    <span className="text-xs text-slate-500">{account.email}</span>
  </div>
);

export const CrewStep = ({
  formData,
  trainingGroupOptions,
  trainingGroups,
  accounts,
  selectedTrainingGroupId,
  handleTrainingGroupChange,
  newTrainingMember,
  setNewTrainingMember,
  newCrewMember,
  setNewCrewMember,
  crewSearchState,
  trainingSearchState,
  canAddCrewMember,
  canAddTrainingMember,
  onAddTrainingMember,
  onAddCrewMember,
  handleCrewAccountSearch,
  handleTrainingAccountSearch,
  handleRemoveCrewMember,
}: CrewStepProps) => {
  const selectedTrainingGroup =
    selectedTrainingGroupId !== null
      ? trainingGroups.find((group) => group.id === selectedTrainingGroupId) ??
        null
      : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <Card className="border-none bg-white shadow-sm">
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
                          value={trainingSearchState.query}
                          suggestions={trainingSearchState.suggestions}
                          completeMethod={handleTrainingAccountSearch}
                          field="name"
                          dropdown
                          className="w-full"
                          inputClassName="w-full"
                          placeholder="Profil suchen"
                          itemTemplate={accountItemTemplate}
                          onChange={(e) => {
                            const nextValue =
                              typeof e.value === "string"
                                ? e.value
                                : e.value?.name ?? "";
                            trainingSearchState.setQuery(nextValue);
                            trainingSearchState.setSelectedAccount(null);
                            setNewTrainingMember((prev) => ({
                              ...prev,
                              name: "",
                              accountId: null,
                            }));
                          }}
                          onSelect={(e) => {
                            const account = e.value as AccountProfile;
                            trainingSearchState.setSelectedAccount(account);
                            trainingSearchState.setQuery(account.name);
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
                          {trainingSearchState.selectedAccount
                            ? trainingSearchState.selectedAccount.email
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
                        trainingSearchState.setSelectedAccount(null);
                        trainingSearchState.setQuery("");
                        trainingSearchState.setSuggestions(accounts);
                      } else {
                        trainingSearchState.setQuery("");
                        trainingSearchState.setSelectedAccount(null);
                      }
                    }}
                    onLabel="Gastprofil"
                    offLabel="Vereinsprofil"
                    onIcon="pi pi-id-card"
                    offIcon="pi pi-user"
                    className="border-none bg-slate-200 text-slate-700 sm:w-48"
                  />
                  <Button
                    label="Profil hinzufügen"
                    icon="pi pi-user-plus"
                    className="w-full rounded-full border-none bg-(--color-primary) px-5 py-3 font-semibold text-white hover:bg-(--color-primary-strong) sm:w-auto"
                    disabled={!canAddTrainingMember}
                    onClick={onAddTrainingMember}
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
                        value={crewSearchState.query}
                        suggestions={crewSearchState.suggestions}
                        completeMethod={handleCrewAccountSearch}
                        field="name"
                        dropdown
                        className="w-full"
                        inputClassName="w-full"
                        placeholder="Profil suchen"
                        itemTemplate={accountItemTemplate}
                        onChange={(e) => {
                          const nextValue =
                            typeof e.value === "string"
                              ? e.value
                              : e.value?.name ?? "";
                          crewSearchState.setQuery(nextValue);
                          crewSearchState.setSelectedAccount(null);
                          setNewCrewMember((prev) => ({
                            ...prev,
                            name: "",
                            accountId: null,
                          }));
                        }}
                        onSelect={(e) => {
                          const account = e.value as AccountProfile;
                          crewSearchState.setSelectedAccount(account);
                          crewSearchState.setQuery(account.name);
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
                        {crewSearchState.selectedAccount
                          ? crewSearchState.selectedAccount.email
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
                    crewSearchState.setSelectedAccount(null);
                    crewSearchState.setQuery("");
                    crewSearchState.setSuggestions(accounts);
                  }}
                  onLabel="Gastprofil"
                  offLabel="Konto verknüpft"
                  onIcon="pi pi-id-card"
                  offIcon="pi pi-user"
                  className="border-none bg-slate-200 text-slate-700 sm:w-48"
                />
                <Button
                  label="Mitfahrer hinzufügen"
                  icon="pi pi-user-plus"
                  className="w-full rounded-full border-none bg-(--color-primary) px-5 py-3 font-semibold text-white hover:bg-(--color-primary-strong) sm:w-auto"
                  disabled={!canAddCrewMember}
                  onClick={onAddCrewMember}
                />
              </div>
            </div>
          )}

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
                          value={member.isGuest ? "Gastprofil" : "Vereinsprofil"}
                          severity={member.isGuest ? "info" : "success"}
                        />
                        {member.birthYear ? (
                          <Tag
                            value={`Jg. ${member.birthYear}`}
                            className="bg-slate-200 text-slate-700"
                          />
                        ) : null}
                      </div>
                    </div>
                    <Button
                      icon="pi pi-times"
                      className="h-9 w-9 rounded-full border-none bg-slate-200 text-slate-600 hover:bg-slate-300"
                      onClick={() => handleRemoveCrewMember(index)}
                      severity="secondary"
                      aria-label={`${member.name} entfernen`}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-6">
        <Card className="border-none bg-white shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">
            Touch-optimierte Aktionen
          </h2>
          <div className="mt-4 flex flex-col gap-3 text-sm text-slate-600">
                <p className="flex items-center gap-2">
                  <i
                    className="pi pi-map-marker text-(--color-primary)"
                    aria-hidden
                  />
                  Wegpunkte können direkt aus der Kartenansicht übernommen werden.
                </p>
            <p className="flex items-center gap-2">
              <i
                className="pi pi-cloud-download text-(--color-accent-2)"
                aria-hidden
              />
              Offline gezeichnete Tracks werden automatisch synchronisiert.
            </p>
            <p className="flex items-center gap-2">
              <i
                className="pi pi-users text-(--color-accent-3)"
                aria-hidden
              />
              Crew kann via QR-Code oder Link eingeladen werden.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
