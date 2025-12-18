"use client";

import { useMemo, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Tag } from "primereact/tag";
import { TabPanel, TabView } from "primereact/tabview";
import { Message } from "primereact/message";
import { MultiSelect } from "primereact/multiselect";
import {
  useLogbookStore,
  type AccountProfile,
  type UserRole,
  type TrainingCrewGroup,
} from "@/lib/stores/logbook-store";
import { useSessionStore } from "@/lib/stores/session-store";

type UserFormState = {
  name: string;
  email: string;
  role: UserRole;
  defaultBoatClass: string;
  defaultRole: AccountProfile["defaultRole"];
  birthYear?: number | null;
};

const roleOptions: { label: string; value: UserRole }[] = [
  { label: "Admin", value: "Admin" },
  { label: "Trainer:in", value: "Trainer:in" },
  { label: "Segler:in", value: "Segler:in" },
];

const onboardRoleOptions: {
  label: string;
  value: AccountProfile["defaultRole"];
}[] = [
  { label: "Crew", value: "Crew" },
  { label: "Trainer", value: "Trainer" },
  { label: "Co-Skipper", value: "Co-Skipper" },
];

const initialForm: UserFormState = {
  name: "",
  email: "",
  role: "Segler:in",
  defaultBoatClass: "",
  defaultRole: "Crew",
  birthYear: null,
};

export default function UserAdminPage() {
  const {
    accounts,
    trainingGroups,
    addAccount,
    updateAccount,
    removeAccount,
    addTrainingGroup,
    updateTrainingGroup,
    removeTrainingGroup,
  } = useLogbookStore((state) => ({
    accounts: state.accounts,
    trainingGroups: state.trainingGroups,
    addAccount: state.addAccount,
    updateAccount: state.updateAccount,
    removeAccount: state.removeAccount,
    addTrainingGroup: state.addTrainingGroup,
    updateTrainingGroup: state.updateTrainingGroup,
    removeTrainingGroup: state.removeTrainingGroup,
  }));
  const { currentRole } = useSessionStore((state) => ({
    currentRole: state.currentRole,
  }));
  const [formState, setFormState] = useState<UserFormState>(initialForm);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<AccountProfile | null>(null);
  const [viewTarget, setViewTarget] = useState<AccountProfile | null>(null);
  const [groupDialogVisible, setGroupDialogVisible] = useState(false);
  const [groupDialogMode, setGroupDialogMode] = useState<"create" | "edit">(
    "create"
  );
  const [groupEditingId, setGroupEditingId] = useState<string | null>(null);
  const [groupForm, setGroupForm] = useState<{
    name: string;
    memberAccountIds: string[];
  }>({ name: "", memberAccountIds: [] });
  const [groupErrors, setGroupErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState(0);

  const isReadOnly = currentRole === "Segler:in";

  const sortedAccounts = useMemo(
    () =>
      [...accounts].sort((a, b) =>
        a.name.localeCompare(b.name, "de", { sensitivity: "base" })
      ),
    [accounts]
  );

  const sortedTrainingGroups = useMemo(
    () =>
      [...trainingGroups].sort((a, b) =>
        a.name.localeCompare(b.name, "de", { sensitivity: "base" })
      ),
    [trainingGroups]
  );

  const accountLookup = useMemo(
    () => new Map(accounts.map((acc) => [acc.id, acc])),
    [accounts]
  );

  const accountOptions = useMemo(
    () =>
      accounts.map((acc) => ({
        label: acc.name,
        value: acc.id,
      })),
    [accounts]
  );

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};
    if (!formState.name.trim()) {
      nextErrors.name = "Name ist ein Pflichtfeld.";
    }
    if (!formState.role) {
      nextErrors.role = "Rolle wählen.";
    }
    if (!formState.defaultBoatClass.trim()) {
      nextErrors.defaultBoatClass = "Standard-Bootsklasse ist ein Pflichtfeld.";
    }
    const normalizedEmail = formState.email.trim();
    if (
      normalizedEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      nextErrors.email = "E-Mail-Adresse ist ungültig.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleOpenCreate = () => {
    setFormState(initialForm);
    setDialogMode("create");
    setEditingId(null);
    setErrors({});
    setDialogVisible(true);
  };

  const handleOpenEdit = (account: AccountProfile) => {
    setDialogMode("edit");
    setEditingId(account.id);
    setFormState({
      name: account.name,
      email: account.email ?? "",
      role: account.role,
      defaultBoatClass: account.defaultBoatClass,
      defaultRole: account.defaultRole,
      birthYear: account.birthYear ?? null,
    });
    setErrors({});
    setDialogVisible(true);
  };

  const handleSave = () => {
    if (isReadOnly) {
      return;
    }
    if (!validateForm()) {
      return;
    }
    const payload = {
      name: formState.name.trim(),
      email: formState.email.trim(),
      role: formState.role,
      defaultBoatClass: formState.defaultBoatClass.trim(),
      defaultRole: formState.defaultRole,
      birthYear: formState.birthYear ?? undefined,
    };
    if (dialogMode === "edit" && editingId) {
      updateAccount(editingId, payload);
    } else {
      addAccount(payload);
    }
    setDialogVisible(false);
    setEditingId(null);
    setFormState(initialForm);
  };

  const validateGroupForm = () => {
    const next: Record<string, string> = {};
    if (!groupForm.name.trim()) {
      next.name = "Name ist ein Pflichtfeld.";
    }
    setGroupErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleOpenGroupCreate = () => {
    setGroupDialogMode("create");
    setGroupEditingId(null);
    setGroupForm({ name: "", memberAccountIds: [] });
    setGroupErrors({});
    setGroupDialogVisible(true);
  };

  const handleOpenGroupEdit = (group: TrainingCrewGroup) => {
    setGroupDialogMode("edit");
    setGroupEditingId(group.id);
    setGroupForm({
      name: group.name,
      memberAccountIds: group.memberAccountIds ?? [],
    });
    setGroupErrors({});
    setGroupDialogVisible(true);
  };

  const handleGroupSave = () => {
    if (isReadOnly) {
      return;
    }
    if (!validateGroupForm()) {
      return;
    }
    if (groupDialogMode === "edit" && groupEditingId) {
      updateTrainingGroup(groupEditingId, { ...groupForm });
    } else {
      addTrainingGroup({ ...groupForm });
    }
    setGroupDialogVisible(false);
    setGroupEditingId(null);
    setGroupForm({ name: "", memberAccountIds: [] });
  };

  const handleGroupDelete = (group: TrainingCrewGroup) => {
    if (isReadOnly) return;
    const confirmed = window.confirm(
      `Trainingsgruppe "${group.name}" wirklich löschen?`
    );
    if (confirmed) {
      removeTrainingGroup(group.id);
    }
  };

  const emailTemplate = (account: AccountProfile) => (
    <span className="text-sm text-slate-600">
      {account.email ?? "Keine E-Mail hinterlegt"}
    </span>
  );

  const actionTemplate = (account: AccountProfile) =>
    isReadOnly ? (
      <div className="flex items-center justify-end gap-2">
        <Button
          icon="pi pi-eye"
          rounded
          outlined
          aria-label={`Anzeigen ${account.name}`}
          onClick={() => setViewTarget(account)}
          className="text-(--color-primary)"
        />
        <span className="text-xs text-slate-400">Nur lesen</span>
      </div>
    ) : (
      <div className="flex items-center justify-end gap-2">
        <Button
          icon="pi pi-eye"
          rounded
          outlined
          aria-label={`Anzeigen ${account.name}`}
          onClick={() => setViewTarget(account)}
          className="text-(--color-primary)"
        />
        <Button
          icon="pi pi-pencil"
          rounded
          aria-label={`Bearbeiten ${account.name}`}
          className="h-10 w-10 border-none bg-(--color-primary)! text-white! hover:bg-(--color-primary-strong)!"
          onClick={() => handleOpenEdit(account)}
        />
        <Button
          icon="pi pi-trash"
          rounded
          aria-label={`Löschen ${account.name}`}
          className="h-10 w-10 border-none bg-(--color-accent-5)! text-white! hover:bg-(--color-accent-4)!"
          onClick={() => setDeleteTarget(account)}
        />
      </div>
    );

  const groupMembersTemplate = (group: TrainingCrewGroup) => {
    const members = (group.memberAccountIds ?? [])
      .map((id) => accountLookup.get(id))
      .filter(Boolean);

    if (!members.length) {
      return (
        <span className="text-sm text-slate-500">
          Keine Benutzer zugeordnet
        </span>
      );
    }

    return (
      <div className="flex flex-wrap gap-2">
        {members.map((member) => (
          <Tag
            key={`${group.id}-${member!.id}`}
            value={member!.name}
            className="border-none! bg-slate-100! text-slate-700!"
          />
        ))}
      </div>
    );
  };

  const groupActionTemplate = (group: TrainingCrewGroup) =>
    isReadOnly ? (
      <span className="text-xs text-slate-400">Nur lesen</span>
    ) : (
      <div className="flex items-center justify-end gap-2">
        <Button
          icon="pi pi-pencil"
          rounded
          aria-label={`Bearbeiten ${group.name}`}
          className="h-10 w-10 border-none bg-(--color-primary)! text-white! hover:bg-(--color-primary-strong)!"
          onClick={() => handleOpenGroupEdit(group)}
        />
        <Button
          icon="pi pi-trash"
          rounded
          aria-label={`Löschen ${group.name}`}
          className="h-10 w-10 border-none bg-(--color-accent-5)! text-white! hover:bg-(--color-accent-4)!"
          onClick={() => handleGroupDelete(group)}
        />
      </div>
    );

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
            Administration
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            Nutzerverwaltung
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Rollenbasierte Verwaltung für Admins & Trainer:innen.
            Standard-Bootsklassen sind Pflicht, E-Mail ist optional damit auch
            Jugend ohne Postfach erfasst werden kann.
          </p>
        </div>
      </header>

      {isReadOnly && (
        <Message
          severity="info"
          text="Segler:innen haben ausschließlich Leserechte. Buttons zum Bearbeiten und Löschen sind ausgeblendet."
        />
      )}

      <TabView
        activeIndex={activeTab}
        onTabChange={(e) => setActiveTab(e.index)}
        className="rounded-2xl border border-slate-200! bg-white shadow-sm [&_.p-tabview-ink-bar]:bg-(--color-primary) [&_.p-tabview-nav-link]:text-(--color-primary)! [&_.p-tabview-nav-link]:font-semibold [&_.p-tabview-nav-link]:transition-colors [&_.p-tabview-nav-link:hover]:text-(--color-primary-strong)!"
      >
        <TabPanel
          header={`Benutzerkonten (${accounts.length})`}
          leftIcon="pi pi-users mr-2"
        >
          <div className="flex flex-col gap-4 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-semibold text-slate-900">
                  Benutzerkonten
                </h2>
                <Tag
                  value={`${accounts.length} Eintrag${
                    accounts.length === 1 ? "" : "e"
                  }`}
                  className="border-none! bg-[rgba(1,168,10,0.12)]! text-(--color-primary)!"
                />
              </div>
              <Button
                label="Benutzer anlegen"
                icon="pi pi-user-plus"
                className="rounded-full border-none bg-(--color-primary) px-4 py-3 text-white shadow-md hover:bg-(--color-primary-strong)"
                onClick={handleOpenCreate}
                disabled={isReadOnly}
              />
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <DataTable
                value={sortedAccounts}
                stripedRows
                className="text-sm [&_.p-datatable-wrapper]:overflow-x-auto [&_.p-datatable-thead>tr>th]:whitespace-nowrap [&_.p-datatable-tbody>tr>td]:whitespace-nowrap"
                responsiveLayout="scroll"
                paginator
                rows={8}
                emptyMessage="Noch keine Benutzer vorhanden."
              >
                <Column field="name" header="Name" sortable />
                <Column field="email" header="E-Mail" body={emailTemplate} />
                <Column
                  header="Aktionen"
                  body={actionTemplate}
                  headerClassName="text-right!"
                  bodyClassName="text-right!"
                />
              </DataTable>
            </div>
          </div>
        </TabPanel>
        <TabPanel
          header={`Trainingsgruppen (${trainingGroups.length})`}
          leftIcon="pi pi-sitemap mr-2"
        >
          <div className="flex flex-col gap-4 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-semibold text-slate-900">
                  Trainingsgruppen
                </h2>
                <Tag
                  value={`${trainingGroups.length} Gruppe${
                    trainingGroups.length === 1 ? "" : "n"
                  }`}
                  className="border-none! bg-[rgba(1,168,10,0.12)]! text-(--color-primary)!"
                />
              </div>
              <Button
                label="Gruppe anlegen"
                icon="pi pi-plus"
                className="rounded-full border-none bg-(--color-primary) px-3 py-2 text-white shadow-sm hover:bg-(--color-primary-strong)"
                onClick={handleOpenGroupCreate}
                disabled={isReadOnly}
              />
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <DataTable
                value={sortedTrainingGroups}
                stripedRows
                className="text-sm [&_.p-datatable-wrapper]:overflow-x-auto [&_.p-datatable-thead>tr>th]:whitespace-nowrap [&_.p-datatable-tbody>tr>td]:whitespace-nowrap"
                responsiveLayout="scroll"
                emptyMessage="Keine Trainingsgruppen hinterlegt."
              >
                <Column field="name" header="Name" />
                <Column header="Benutzerkonten" body={groupMembersTemplate} />
                <Column
                  header="Aktionen"
                  body={groupActionTemplate}
                  headerClassName="text-right"
                  bodyClassName="text-right"
                />
              </DataTable>
            </div>
          </div>
        </TabPanel>
      </TabView>

      <Dialog
        header={
          dialogMode === "edit" ? "Benutzer bearbeiten" : "Benutzer anlegen"
        }
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        className="w-full sm:w-2/3 lg:w-1/2"
        breakpoints={{ "960px": "85vw", "640px": "95vw" }}
      >
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wide text-slate-400">
                Name *
              </label>
              <InputText
                value={formState.name}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, name: e.target.value }))
                }
                className={errors.name ? "p-invalid" : ""}
                placeholder="Vor- und Nachname"
              />
              {errors.name && <small className="p-error">{errors.name}</small>}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wide text-slate-400">
                Rolle *
              </label>
              <Dropdown
                value={formState.role}
                options={roleOptions}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, role: e.value }))
                }
                className={errors.role ? "p-invalid" : ""}
                placeholder="Rolle auswählen"
              />
              {errors.role && <small className="p-error">{errors.role}</small>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wide text-slate-400">
                Standard-Bootsklasse *
              </label>
              <InputText
                value={formState.defaultBoatClass}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    defaultBoatClass: e.target.value,
                  }))
                }
                className={errors.defaultBoatClass ? "p-invalid" : ""}
                placeholder="z. B. J/70, Opti, Laser"
              />
              {errors.defaultBoatClass && (
                <small className="p-error">{errors.defaultBoatClass}</small>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wide text-slate-400">
                E-Mail (optional)
              </label>
              <InputText
                value={formState.email}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, email: e.target.value }))
                }
                className={errors.email ? "p-invalid" : ""}
                placeholder="nutzende@verein.de"
              />
              {errors.email ? (
                <small className="p-error">{errors.email}</small>
              ) : (
                <small className="text-xs text-slate-500">
                  Kann leer bleiben, wenn keine Adresse vorhanden ist (z. B.
                  Jugend). Standard-Bootsklasse bleibt Pflicht.
                </small>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wide text-slate-400">
                Standardrolle an Bord
              </label>
              <Dropdown
                value={formState.defaultRole}
                options={onboardRoleOptions}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, defaultRole: e.value }))
                }
                placeholder="Crew / Trainer / Co-Skipper"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wide text-slate-400">
                Geburtsjahr (optional)
              </label>
              <InputNumber
                value={formState.birthYear ?? undefined}
                onValueChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    birthYear: e.value ?? null,
                  }))
                }
                min={1940}
                max={new Date().getFullYear()}
                placeholder="2008"
                useGrouping={false}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              label="Abbrechen"
              severity="secondary"
              outlined
              onClick={() => setDialogVisible(false)}
            />
            <Button
              label={dialogMode === "edit" ? "Speichern" : "Anlegen"}
              icon={dialogMode === "edit" ? "pi pi-save" : "pi pi-user-plus"}
              onClick={handleSave}
              disabled={isReadOnly}
            />
          </div>
        </div>
      </Dialog>

      <Dialog
        header={
          groupDialogMode === "edit"
            ? "Trainingsgruppe bearbeiten"
            : "Trainingsgruppe anlegen"
        }
        visible={groupDialogVisible}
        onHide={() => setGroupDialogVisible(false)}
        className="w-full sm:w-2/3 lg:w-1/2"
        breakpoints={{ "960px": "85vw", "640px": "95vw" }}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wide text-slate-400">
              Name *
            </label>
            <InputText
              value={groupForm.name}
              onChange={(e) =>
                setGroupForm((prev) => ({ ...prev, name: e.target.value }))
              }
              className={groupErrors.name ? "p-invalid" : ""}
              placeholder="z. B. Junior Basics"
            />
            {groupErrors.name && (
              <small className="p-error">{groupErrors.name}</small>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wide text-slate-400">
              Benutzerkonten
            </label>
            <MultiSelect
              value={groupForm.memberAccountIds}
              options={accountOptions}
              onChange={(e) =>
                setGroupForm((prev) => ({
                  ...prev,
                  memberAccountIds: e.value ?? [],
                }))
              }
              placeholder="Konten auswählen"
              display="chip"
              filter
              showClear
            />
            <small className="text-xs text-slate-500">
              Auswahl optional. Leerlassen, wenn die Gruppe später befüllt wird.
            </small>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              label="Abbrechen"
              severity="secondary"
              outlined
              onClick={() => setGroupDialogVisible(false)}
            />
            <Button
              label={groupDialogMode === "edit" ? "Speichern" : "Anlegen"}
              icon={groupDialogMode === "edit" ? "pi pi-save" : "pi pi-plus"}
              onClick={handleGroupSave}
              disabled={isReadOnly}
            />
          </div>
        </div>
      </Dialog>

      <Dialog
        header="Benutzer löschen"
        visible={!!deleteTarget}
        onHide={() => setDeleteTarget(null)}
        className="w-full sm:w-96"
      >
        <p className="text-sm text-slate-600">
          Möchtest du{" "}
          <span className="font-semibold text-slate-900">
            {deleteTarget?.name}
          </span>{" "}
          wirklich löschen? Die Nutzer:in wird aus der Liste entfernt.
          Verbundene Delegationen werden mitgelöscht.
        </p>
        <div className="mt-4 flex justify-end gap-3">
          <Button
            label="Abbrechen"
            severity="secondary"
            outlined
            onClick={() => setDeleteTarget(null)}
          />
          <Button
            label="Löschen"
            icon="pi pi-trash"
            severity="danger"
            onClick={() => {
              if (deleteTarget) {
                removeAccount(deleteTarget.id);
              }
              setDeleteTarget(null);
            }}
          />
        </div>
      </Dialog>

      <Dialog
        header="Benutzerdetails"
        visible={!!viewTarget}
        onHide={() => setViewTarget(null)}
        className="w-full sm:w-96"
      >
        <div className="flex flex-col gap-2 text-sm text-slate-700">
          <p>
            <span className="font-semibold text-slate-900">Name:</span>{" "}
            {viewTarget?.name}
          </p>
          <p>
            <span className="font-semibold text-slate-900">E-Mail:</span>{" "}
            {viewTarget?.email ?? "Keine E-Mail hinterlegt"}
          </p>
          <p>
            <span className="font-semibold text-slate-900">Rolle:</span>{" "}
            {viewTarget?.role}
          </p>
          <p>
            <span className="font-semibold text-slate-900">
              Standard-Bootsklasse:
            </span>{" "}
            {viewTarget?.defaultBoatClass}
          </p>
          <p>
            <span className="font-semibold text-slate-900">
              Standardrolle an Bord:
            </span>{" "}
            {viewTarget?.defaultRole}
          </p>
          {viewTarget?.birthYear ? (
            <p>
              <span className="font-semibold text-slate-900">Geburtsjahr:</span>{" "}
              {viewTarget.birthYear}
            </p>
          ) : null}
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            label="Schließen"
            severity="secondary"
            outlined
            onClick={() => setViewTarget(null)}
          />
        </div>
      </Dialog>
    </div>
  );
}
