"use client";

import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Avatar } from "primereact/avatar";
import { Tag } from "primereact/tag";
import { ToggleButton } from "primereact/togglebutton";
import { Checkbox } from "primereact/checkbox";
import { Dialog } from "primereact/dialog";
import { AutoComplete } from "primereact/autocomplete";
import { useEffect, useState } from "react";
import {
  useLogbookStore,
  type AccountProfile,
  type Delegate,
} from "../../lib/stores/logbook-store";
import {
  useProfileStore,
  type ProfileStat,
} from "../../lib/stores/profile-store";

type AutoCompleteCompleteMethodParams = {
  originalEvent: unknown;
  query: string;
};

export default function ProfilePage() {
  const {
    accounts,
    delegates,
    incomingDelegations,
    addDelegate,
    updateDelegatePermissions,
    removeDelegate,
  } = useLogbookStore((state) => ({
    accounts: state.accounts,
    delegates: state.delegates,
    incomingDelegations: state.incomingDelegations,
    addDelegate: state.addDelegate,
    updateDelegatePermissions: state.updateDelegatePermissions,
    removeDelegate: state.removeDelegate,
  }));
  const stats = useProfileStore((state) => state.stats);
  const [offlineMode, setOfflineMode] = useState(true);
  const [unitMetric, setUnitMetric] = useState(true);
  const [delegateForm, setDelegateForm] = useState({
    name: "",
    email: "",
    canRead: true,
    canWrite: false,
  });
  const [delegateModalVisible, setDelegateModalVisible] = useState(false);
  const [delegateSearch, setDelegateSearch] = useState("");
  const [accountSuggestions, setAccountSuggestions] = useState(accounts);
  const [selectedAccount, setSelectedAccount] = useState<AccountProfile | null>(
    null
  );

  useEffect(() => {
    if (delegateForm.canWrite && !delegateForm.canRead) {
      setDelegateForm((prev) => ({ ...prev, canRead: true }));
    }
  }, [delegateForm.canWrite, delegateForm.canRead]);

  useEffect(() => {
    setAccountSuggestions(accounts);
  }, [accounts]);

  const handleAddDelegate = () => {
    if (!selectedAccount) {
      return;
    }
    addDelegate({
      accountId: selectedAccount.id,
      canRead: delegateForm.canRead,
      canWrite: delegateForm.canWrite,
    });
    setDelegateForm({
      name: "",
      email: "",
      canRead: true,
      canWrite: false,
    });
    setDelegateSearch("");
    setSelectedAccount(null);
    setDelegateModalVisible(false);
  };

  const handleAccountSearch = (event: AutoCompleteCompleteMethodParams) => {
    const query = event.query.trim().toLowerCase();
    if (!query) {
      setAccountSuggestions(accounts);
      return;
    }
    setAccountSuggestions(
      accounts.filter(
        (account: AccountProfile) =>
          account.name.toLowerCase().includes(query) ||
          (account.email ?? "").toLowerCase().includes(query)
      )
    );
  };

  const accountItemTemplate = (account: AccountProfile) => (
    <div className="flex flex-col">
      <span className="text-sm font-medium text-slate-900">{account.name}</span>
      <span className="text-xs text-slate-500">
        {account.email ?? "Keine E-Mail hinterlegt"}
      </span>
    </div>
  );

  const handleDelegatePermissionChange = (
    id: string,
    key: "canRead" | "canWrite",
    value: boolean
  ) => {
    if (key === "canWrite") {
      updateDelegatePermissions(id, { canWrite: value });
    } else {
      updateDelegatePermissions(id, { canRead: value });
    }
  };

  const handleRemoveDelegate = (id: string) => {
    removeDelegate(id);
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <Avatar
            label="LV"
            className="h-16! w-16! bg-(--color-primary)! text-lg! font-semibold! text-white!"
          />
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
              Profil
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">
              Laura Vogt
            </h1>
            <p className="text-sm text-slate-500">
              Brandenburger Segelverein – Lizenz Nr. BSV-2845
            </p>
          </div>
        </div>
        {/* <Button
          label="Profil bearbeiten"
          icon="pi pi-user-edit"
          className="rounded-full! border-none! bg-slate-200! px-5! py-3! text-slate-700! hover:bg-slate-300!"
          onClick={() => router.push("/profile/edit")}
        /> */}
      </header>

      <Card className="border-none bg-white! shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Statistiken</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat: ProfileStat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-200 px-4 py-3"
            >
              <p className="text-xs uppercase tracking-wide text-slate-400">
                {stat.label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Dialog
        header="Delegation hinzufügen"
        visible={delegateModalVisible}
        onHide={() => setDelegateModalVisible(false)}
        className="w-full! sm:w-96!"
        breakpoints={{ "960px": "75vw", "640px": "95vw" }}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <AutoComplete
              value={delegateSearch}
              suggestions={accountSuggestions}
              completeMethod={handleAccountSearch}
              field="name"
              dropdown
              className="w-full"
              inputClassName="w-full"
              placeholder="Profil suchen (Name oder E-Mail)"
              itemTemplate={accountItemTemplate}
              onChange={(e) => {
                const nextValue =
                  typeof e.value === "string" ? e.value : e.value?.name ?? "";
                setDelegateSearch(nextValue);
                setSelectedAccount(null);
                setDelegateForm((prev) => ({ ...prev, name: "", email: "" }));
              }}
              onSelect={(e) => {
                const account = e.value as AccountProfile;
                setSelectedAccount(account);
                setDelegateSearch(account.name);
                setDelegateForm((prev) => ({
                  ...prev,
                  name: account.name,
                  email: account.email ?? "",
                }));
              }}
            />
            <p className="text-xs text-slate-500">
              {selectedAccount
                ? selectedAccount.email
                : "Wähle ein bestehendes Profil aus der Vereinsdatenbank."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <label className="inline-flex items-center gap-2">
              <Checkbox
                inputId="delegateRead"
                checked={delegateForm.canRead}
                onChange={(e) =>
                  setDelegateForm((prev) => ({
                    ...prev,
                    canRead: e.checked ?? false,
                    canWrite: e.checked ? prev.canWrite : false,
                  }))
                }
              />
              Lesen
            </label>
            <label className="inline-flex items-center gap-2">
              <Checkbox
                inputId="delegateWrite"
                checked={delegateForm.canWrite}
                onChange={(e) =>
                  setDelegateForm((prev) => ({
                    ...prev,
                    canWrite: e.checked ?? false,
                    canRead: e.checked ? true : prev.canRead,
                  }))
                }
              />
              Schreiben
            </label>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              label="Abbrechen"
              outlined
              severity="secondary"
              size="small"
              onClick={() => setDelegateModalVisible(false)}
              type="button"
            />
            <Button
              label="Delegation hinzufügen"
              icon="pi pi-user-plus"
              size="small"
              onClick={handleAddDelegate}
              disabled={!selectedAccount}
              type="button"
            />
          </div>
        </div>
      </Dialog>

      <Card className="border-none bg-white! shadow-sm">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Delegationen & Rechte
            </h2>
            <p className="text-sm text-slate-500">
              Erlaube ausgewählten Personen dein Logbuch zu lesen oder zu
              bearbeiten. Du behältst jederzeit die Kontrolle.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Tag
              value={`${delegates.length} aktive Delegation${
                delegates.length === 1 ? "" : "en"
              }`}
              className="border-none! bg-[rgba(1,168,10,0.12)]! text-(--color-primary)!"
            />
            <Button
              icon="pi pi-plus"
              rounded
              aria-label="Delegation hinzufügen"
              className="border-none! bg-(--color-primary)! text-white! hover:bg-(--color-primary-strong)!"
              onClick={() => {
                setDelegateModalVisible(true);
                setDelegateSearch("");
                setSelectedAccount(null);
                setAccountSuggestions(accounts);
                setDelegateForm((prev) => ({
                  ...prev,
                  name: "",
                  email: "",
                }));
              }}
            />
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
          Nutze das Plus-Symbol, um eine neue Delegation hinzuzufügen. Jede
          Person kann individuelle Lese- und Schreibrechte erhalten.
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {delegates.length === 0 ? (
            <p className="text-xs text-slate-500">
              Noch keine Delegationen eingerichtet.
            </p>
          ) : (
            delegates.map((delegate: Delegate) => (
              <div
                key={delegate.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {delegate.name}
                  </p>
                  <p className="text-xs text-slate-500">{delegate.email}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    {delegate.canRead && (
                      <Tag value="Lesen" severity="success" />
                    )}
                    {delegate.canWrite && (
                      <Tag value="Schreiben" severity="warning" />
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                    <Checkbox
                      inputId={`delegate-read-${delegate.id}`}
                      checked={delegate.canRead}
                      onChange={(e) =>
                        handleDelegatePermissionChange(
                          delegate.id,
                          "canRead",
                          e.checked ?? false
                        )
                      }
                    />
                    Lesen
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                    <Checkbox
                      inputId={`delegate-write-${delegate.id}`}
                      checked={delegate.canWrite}
                      onChange={(e) =>
                        handleDelegatePermissionChange(
                          delegate.id,
                          "canWrite",
                          e.checked ?? false
                        )
                      }
                    />
                    Schreiben
                  </label>
                  <Button
                    icon="pi pi-trash"
                    rounded
                    className="delete-icon-button"
                    aria-label={`${delegate.name} entfernen`}
                    onClick={() => handleRemoveDelegate(delegate.id)}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card className="border-none bg-white! shadow-sm">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Meine Zugriffe
            </h2>
            <p className="text-sm text-slate-500">
              Hier siehst du, welche Profile dir Leserechte oder Schreibrechte
              erteilt haben.
            </p>
          </div>
          <Tag
            value={`${incomingDelegations.length} Profil${
              incomingDelegations.length === 1 ? "" : "e"
            }`}
            className="border-none! bg-[rgba(1,168,10,0.12)]! text-(--color-primary)!"
          />
        </div>
        <div className="mt-4 flex flex-col gap-3">
          {incomingDelegations.length === 0 ? (
            <p className="text-xs text-slate-500">
              Aktuell hast du keine Zugriffsrechte auf andere Profile.
            </p>
          ) : (
            incomingDelegations.map((access) => {
              const owner = accounts.find(
                (account) => account.id === access.ownerAccountId
              );
              return (
                <div
                  key={access.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {owner?.name ?? "Unbekanntes Profil"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {owner?.email ?? "Keine E-Mail hinterlegt"}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      {access.canRead && (
                        <Tag value="Lesen" severity="success" />
                      )}
                      {access.canWrite && (
                        <Tag value="Schreiben" severity="warning" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      <div className="grid gap-6">
        <Card className="border-none bg-white! shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">
            Einstellungen
          </h2>
          <div className="mt-4 flex flex-col gap-4 text-sm text-slate-600">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-slate-900">Offline Modus</p>
                <p className="text-xs text-slate-500">
                  Törns lokal speichern und später synchronisieren.
                </p>
              </div>
              <ToggleButton
                checked={offlineMode}
                onChange={(e) => setOfflineMode(e.value)}
                onLabel="Ein"
                offLabel="Aus"
                className="border-none! bg-slate-200! text-slate-700!"
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-slate-900">Einheiten</p>
                <p className="text-xs text-slate-500">
                  Wechsel zwischen metrisch (km) und nautisch (sm).
                </p>
              </div>
              <ToggleButton
                checked={unitMetric}
                onChange={(e) => setUnitMetric(e.value)}
                onLabel="Metrisch"
                offLabel="Nautisch"
                className="border-none! bg-slate-200! text-slate-700!"
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-slate-900">Sprache</p>
                <p className="text-xs text-slate-500">
                  Deutsch, Englisch (bald), Dänisch (geplant)
                </p>
              </div>
              <Tag value="Deutsch" severity="info" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
