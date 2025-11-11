"use client";

import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Avatar } from "primereact/avatar";
import { Tag } from "primereact/tag";
import { ToggleButton } from "primereact/togglebutton";
import { Checkbox } from "primereact/checkbox";
import { Dialog } from "primereact/dialog";
import { AutoComplete } from "primereact/autocomplete";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  formatDurationMinutes,
  trackingStore,
  type GpsTrack,
} from "../../lib/tracking-store";

const stats = [
  { label: "Gesamtpunkte", value: "1.280" },
  { label: "Distanz", value: "642 km" },
  { label: "Segelstunden", value: "84 h" },
  { label: "Törns dieses Jahr", value: "18" },
];

const ACCOUNT_DIRECTORY = [
  { id: "account-001", name: "Nils Brenner", email: "nils@masys.app" },
  { id: "account-002", name: "Mara Lenz", email: "mara.lenz@bsv.de" },
  { id: "account-003", name: "Kim Albrecht", email: "kim.albrecht@masys.app" },
  { id: "account-004", name: "Laura Vogt", email: "laura.vogt@bsv.de" },
  { id: "account-005", name: "Tom Reimann", email: "tom.reimann@masys.app" },
];

type AutoCompleteCompleteMethodParams = {
  originalEvent: unknown;
  query: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [offlineMode, setOfflineMode] = useState(true);
  const [unitMetric, setUnitMetric] = useState(true);
  const tracks = useSyncExternalStore(
    trackingStore.subscribe,
    trackingStore.getSnapshot,
    trackingStore.getServerSnapshot,
  );
  const [trackingActive, setTrackingActive] = useState(false);
  const [trackingStart, setTrackingStart] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [delegates, setDelegates] = useState<
    {
      id: string;
      name: string;
      email: string;
      canRead: boolean;
      canWrite: boolean;
    }[]
  >([
    {
      id: "delegate-1",
      name: "Nils Brenner",
      email: "nils@masys.app",
      canRead: true,
      canWrite: true,
    },
    {
      id: "delegate-2",
      name: "Mara Lenz",
      email: "mara.lenz@bsv.de",
      canRead: true,
      canWrite: false,
    },
  ]);
  const [delegateForm, setDelegateForm] = useState({
    name: "",
    email: "",
    canRead: true,
    canWrite: false,
  });
  const [delegateModalVisible, setDelegateModalVisible] = useState(false);
  const [delegateSearch, setDelegateSearch] = useState("");
  const [accountSuggestions, setAccountSuggestions] = useState(
    ACCOUNT_DIRECTORY,
  );
  const [selectedAccount, setSelectedAccount] =
    useState<(typeof ACCOUNT_DIRECTORY)[number] | null>(null);

  useEffect(() => {
    if (!trackingActive || !trackingStart) {
      return;
    }
    const interval = setInterval(() => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - trackingStart.getTime()) / 1000)));
    }, 1000);
    return () => clearInterval(interval);
  }, [trackingActive, trackingStart]);

  useEffect(() => {
    if (delegateForm.canWrite && !delegateForm.canRead) {
      setDelegateForm((prev) => ({ ...prev, canRead: true }));
    }
  }, [delegateForm.canWrite, delegateForm.canRead]);

  const simulatedDistanceKm = useMemo(() => {
    if (!trackingActive) {
      return 0;
    }
    const minutes = elapsedSeconds / 60;
    return Number(Math.max(minutes * 0.45, 0.2).toFixed(1));
  }, [elapsedSeconds, trackingActive]);

  const elapsedLabel = useMemo(() => {
    const hours = Math.floor(elapsedSeconds / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((elapsedSeconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const seconds = Math.floor(elapsedSeconds % 60)
      .toString()
      .padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  }, [elapsedSeconds]);

  const handleStartTracking = () => {
    setTrackingStart(new Date());
    setElapsedSeconds(0);
    setTrackingActive(true);
  };

  const resetTracking = () => {
    setTrackingActive(false);
    setTrackingStart(null);
    setElapsedSeconds(0);
  };

  const handleSaveTracking = () => {
    if (!trackingStart) {
      return;
    }
    const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
    const newTrack: GpsTrack = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `track-${Date.now()}`,
      title: `Direktaufnahme ${new Date().toLocaleDateString("de-DE")} ${new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}`,
      startedAt: trackingStart.toISOString(),
      durationMinutes,
      distanceKm: simulatedDistanceKm > 0 ? simulatedDistanceKm : 0.2,
    };
    trackingStore.addTrack(newTrack);
    resetTracking();
  };

  const handleAddDelegate = () => {
    if (!selectedAccount) {
      return;
    }
    const payload = {
      id: selectedAccount.id,
      name: selectedAccount.name,
      email: selectedAccount.email,
      canRead: delegateForm.canRead,
      canWrite: delegateForm.canWrite,
    };
    setDelegates((prev) => {
      const index = prev.findIndex(
        (delegate) => delegate.email === payload.email,
      );
      if (index >= 0) {
        const next = [...prev];
        next[index] = { ...next[index], ...payload };
        return next;
      }
      return [...prev, payload];
    });
    setDelegateForm({
      name: "",
      email: "",
      canRead: true,
      canWrite: false,
    });
    setDelegateSearch("");
    setSelectedAccount(null);
    setAccountSuggestions(ACCOUNT_DIRECTORY);
    setDelegateModalVisible(false);
  };

  const handleAccountSearch = (event: AutoCompleteCompleteMethodParams) => {
    const query = event.query.trim().toLowerCase();
    if (!query) {
      setAccountSuggestions(ACCOUNT_DIRECTORY);
      return;
    }
    setAccountSuggestions(
      ACCOUNT_DIRECTORY.filter(
        (account) =>
          account.name.toLowerCase().includes(query) ||
          account.email.toLowerCase().includes(query),
      ),
    );
  };

  const accountItemTemplate = (account: (typeof ACCOUNT_DIRECTORY)[number]) => (
    <div className="flex flex-col">
      <span className="text-sm font-medium text-slate-900">{account.name}</span>
      <span className="text-xs text-slate-500">{account.email}</span>
    </div>
  );

  const handleDelegatePermissionChange = (
    id: string,
    key: "canRead" | "canWrite",
    value: boolean,
  ) => {
    setDelegates((prev) =>
      prev.map((delegate) => {
        if (delegate.id !== id) {
          return delegate;
        }
        if (key === "canWrite" && value) {
          return { ...delegate, canRead: true, canWrite: true };
        }
        if (key === "canRead" && !value) {
          return { ...delegate, canRead: false, canWrite: false };
        }
        return { ...delegate, [key]: value };
      }),
    );
  };

  const handleRemoveDelegate = (id: string) => {
    setDelegates((prev) => prev.filter((delegate) => delegate.id !== id));
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <Avatar
            label="LV"
            className="!h-16 !w-16 !bg-[var(--color-primary)] !text-lg !font-semibold !text-white"
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
        <Button
          label="Profil bearbeiten"
          icon="pi pi-user-edit"
          className="!rounded-full !border-none !bg-slate-200 !px-5 !py-3 !text-slate-700 hover:!bg-slate-300"
          onClick={() => router.push("/profile/edit")}
        />
      </header>

      <Card className="border-none !bg-white shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Statistiken</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
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
        className="!w-full sm:!w-96"
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
                const account = e.value as (typeof ACCOUNT_DIRECTORY)[number];
                setSelectedAccount(account);
                setDelegateSearch(account.name);
                setDelegateForm((prev) => ({
                  ...prev,
                  name: account.name,
                  email: account.email,
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

      <Card className="border-none !bg-white shadow-sm">
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
              value={`${delegates.length} aktive Delegation${delegates.length === 1 ? "" : "en"}`}
              className="!border-none !bg-[rgba(1,168,10,0.12)] !text-[var(--color-primary)]"
            />
            <Button
              icon="pi pi-plus"
              rounded
              aria-label="Delegation hinzufügen"
              className="!border-none !bg-[var(--color-primary)] !text-white hover:!bg-[var(--color-primary-strong)]"
              onClick={() => {
                setDelegateModalVisible(true);
                setDelegateSearch("");
                setSelectedAccount(null);
                setAccountSuggestions(ACCOUNT_DIRECTORY);
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
            delegates.map((delegate) => (
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
                    <Tag
                      value="Lesen"
                      severity={delegate.canRead ? "success" : "secondary"}
                    />
                    <Tag
                      value="Schreiben"
                      severity={delegate.canWrite ? "warning" : "secondary"}
                    />
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
                          e.checked ?? false,
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
                          e.checked ?? false,
                        )
                      }
                    />
                    Schreiben
                  </label>
                  <Button
                    icon="pi pi-trash"
                    rounded
                    text
                    severity="danger"
                    aria-label={`${delegate.name} entfernen`}
                    onClick={() => handleRemoveDelegate(delegate.id)}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card className="border-none !bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <h2 className="text-2xl font-semibold text-slate-900">
            GPS Tracking
          </h2>
          <Tag
            value={
              trackingActive
                ? "Aufnahme läuft"
                : `${tracks.length} Track${tracks.length === 1 ? "" : "s"}`
            }
            className={`!border-none ${
              trackingActive
                ? "!bg-[rgba(94,1,168,0.15)] !text-[var(--color-accent-5)]"
                : "!bg-[rgba(1,168,10,0.12)] !text-[var(--color-primary)]"
            }`}
          />
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          <div className="rounded-2xl border border-slate-200 p-4">
            {trackingActive && trackingStart ? (
              <>
                <p className="text-sm text-slate-500">
                  Aufnahme seit{" "}
                  {trackingStart.toLocaleTimeString("de-DE", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Laufzeit
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      {elapsedLabel}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Distanz (∼)
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      {simulatedDistanceKm.toFixed(1)} km
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Geschwindigkeit (∼)
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      {elapsedSeconds > 0
                        ? `${Math.max(
                            simulatedDistanceKm / Math.max(elapsedSeconds / 3600, 0.1),
                            0,
                          ).toFixed(1)} kn`
                        : "–"}
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button
                    label="Tracking speichern"
                    icon="pi pi-save"
                    className="!w-full !border-none !bg-[var(--color-primary)] !px-5 !py-3 !font-semibold !text-white hover:!bg-[var(--color-primary-strong)] sm:!w-auto"
                    onClick={handleSaveTracking}
                  />
                  <Button
                    label="Abbrechen"
                    icon="pi pi-times"
                    className="!w-full !border border-slate-300 !bg-white !px-5 !py-3 !font-semibold !text-slate-700 hover:!bg-slate-50 sm:!w-auto"
                    onClick={resetTracking}
                  />
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-slate-500">
                  Starte hier eine GPS-Aufzeichnung. Sobald du speicherst,
                  steht der Track im Formular &quot;Neuen Törn anlegen&quot;
                  zur Auswahl bereit.
                </p>
                <Button
                  label="Tracking starten"
                  icon="pi pi-map-marker"
                  className="!mt-4 !w-full !border-none !bg-[var(--color-primary)] !px-5 !py-3 !font-semibold !text-white hover:!bg-[var(--color-primary-strong)] sm:!w-auto"
                  onClick={handleStartTracking}
                />
              </>
            )}
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Aufgezeichnete Tracks
            </p>
            <div className="mt-3 flex flex-col gap-3">
              {tracks.length === 0 ? (
                <p className="text-xs text-slate-500">
                  Noch keine GPS-Tracks gespeichert.
                </p>
              ) : (
                tracks.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {track.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDurationMinutes(track.durationMinutes)} ·{" "}
                        {track.distanceKm.toFixed(1)} km ·{" "}
                        {new Date(track.startedAt).toLocaleString("de-DE", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <Button
                      icon="pi pi-trash"
                      text
                      rounded
                      severity="secondary"
                      className="!text-slate-400 hover:!text-rose-500"
                      aria-label="Track löschen"
                      onClick={() => trackingStore.removeTrack(track.id)}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6">
        <Card className="border-none !bg-white shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">Einstellungen</h2>
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
                className="!border-none !bg-slate-200 !text-slate-700"
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
                className="!border-none !bg-slate-200 !text-slate-700"
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
