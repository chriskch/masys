"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tooltip } from "primereact/tooltip";
import { useLogbookStore } from "../../lib/stores/logbook-store";
import type { Trip, LogbookStore } from "../../lib/stores/logbook-store";

const statusToColor: Record<Trip["status"], string> = {
  Abgeschlossen: "var(--color-primary)",
  "In Planung": "var(--color-accent-3)",
  Auswertung: "var(--color-accent-2)",
};

const selectTripsSlice = (state: LogbookStore) => ({
  trips: state.trips,
  delegates: state.delegates,
});

export default function TripsPage() {
  const router = useRouter();
  const { trips, delegates } = useLogbookStore(selectTripsSlice);
  const [searchTerm, setSearchTerm] = useState("");
  const [boat, setBoat] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);

  const accessibleProfiles = useMemo(
    () => [
      { value: "me", label: "Mein Profil", rights: "Lesen & Schreiben" },
      ...delegates.map((delegate) => ({
        value: delegate.id,
        label: delegate.name,
        rights: delegate.canWrite ? "Lesen & Schreiben" : "Nur Lesen",
      })),
    ],
    [delegates],
  );

  const [profileId, setProfileId] = useState(
    accessibleProfiles[0]?.value ?? "me",
  );

  useEffect(() => {
    if (!accessibleProfiles.some((profile) => profile.value === profileId)) {
      setProfileId(accessibleProfiles[0]?.value ?? "me");
    }
  }, [accessibleProfiles, profileId]);

  const boatOptions = useMemo(
    () =>
      Array.from(new Set(trips.map((trip) => trip.boat))).map((boat) => ({
        label: boat,
        value: boat,
      })),
    [trips],
  );

  const filteredTrips = useMemo(() => {
    const [startDate, endDate] = dateRange;
    const startBound =
      startDate !== null
        ? new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate(),
          ).getTime()
        : null;
    const endBound =
      endDate !== null
        ? new Date(
            endDate.getFullYear(),
            endDate.getMonth(),
            endDate.getDate(),
            23,
            59,
            59,
            999,
          ).getTime()
        : null;

    return trips.filter((trip) => {
      const matchesSearch =
        trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBoat = boat ? trip.boat === boat : true;
      const matchesProfile = trip.ownerId === profileId;

      const tripTime = new Date(trip.dateISO).getTime();
      const matchesStart =
        startBound !== null ? tripTime >= startBound : true;
      const matchesEnd = endBound !== null ? tripTime <= endBound : true;

      return (
        matchesSearch &&
        matchesBoat &&
        matchesProfile &&
        matchesStart &&
        matchesEnd
      );
    });
  }, [searchTerm, boat, dateRange, profileId, trips]);

  const handleExport = () => {
    if (filteredTrips.length === 0) {
      return;
    }
    const header = [
      "ID",
      "Titel",
      "Boot",
      "Distanz (km)",
      "Dauer",
      "Start",
      "Ziel",
      "Datum",
      "Status",
    ];
    const rows = filteredTrips.map((trip) => [
      trip.id,
      trip.title,
      trip.boat,
      trip.distance.toFixed(1),
      trip.duration,
      trip.start,
      trip.target,
      new Date(trip.dateISO).toLocaleDateString("de-DE"),
      trip.status,
    ]);

    const csv = [header, ...rows]
      .map((cols) =>
        cols
          .map((col) => `"${String(col).replace(/"/g, '""')}"`)
          .join(";"),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const profileLabel =
      accessibleProfiles.find((profile) => profile.value === profileId)
        ?.label ?? "profil";
    link.href = url;
    link.download = `toerns_${profileLabel.replace(/\s+/g, "_").toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6">
      <Tooltip target=".trip-status-dot" />
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
            Törns
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            Deine Segelprotokolle im Überblick
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Filtere nach Datum, Boot oder Status und öffne Details mit einem
            Tipp.
          </p>
        </div>
        <Button
          label="Neuen Törn starten"
          icon="pi pi-plus"
          className="!w-full !justify-center !rounded-full !border-none !bg-[var(--color-primary)] !px-5 !py-3 !text-base !font-semibold !text-white shadow-md hover:!bg-[var(--color-primary-strong)] sm:!w-auto"
          onClick={() => router.push("/new-trip")}
        />
      </header>

      <Card className="border-none !bg-white shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-1 flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <label className="text-xs uppercase tracking-wide text-slate-400">
                  Profil
                </label>
                <Dropdown
                  value={profileId}
                  onChange={(e) => setProfileId(e.value)}
                  options={accessibleProfiles.map((profile) => ({
                    label: `${profile.label} (${profile.rights})`,
                    value: profile.value,
                  }))}
                  className="mt-1 w-full"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs uppercase tracking-wide text-slate-400">
                  Suche
                </label>
                <InputText
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Titel oder ID"
                  className="mt-1 w-full"
                />
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <label className="text-xs uppercase tracking-wide text-slate-400">
                  Boot
                </label>
                <Dropdown
                  value={boat}
                  onChange={(e) => setBoat(e.value)}
                  options={boatOptions}
                  placeholder="Alle Boote"
                  showClear
                  className="mt-1 w-full"
                />
              </div>
              <div className="w-full sm:flex-1">
                <label className="text-xs uppercase tracking-wide text-slate-400">
                  Zeitraum
                </label>
                <Calendar
                  value={dateRange}
                  onChange={(e) => {
                    const value = e.value as [Date | null, Date | null];
                    setDateRange(value ?? [null, null]);
                  }}
                  selectionMode="range"
                  numberOfMonths={2}
                  placeholder="Zeitraum wählen"
                  className="mt-1 w-full"
                  touchUI
                />
              </div>
            </div>
          </div>
          <Button
            label="Angezeigte Törns exportieren"
            icon="pi pi-download"
            className="!w-full !justify-center !rounded-full !border !border-[rgba(1,168,10,0.4)] !bg-white !px-5 !py-3 !text-[var(--color-primary)] hover:!border-[rgba(1,168,10,0.6)] hover:!bg-[rgba(1,168,10,0.05)] md:!w-auto"
            onClick={handleExport}
            disabled={filteredTrips.length === 0}
          />
        </div>
      </Card>

      <Card className="border-none !bg-white shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">
          Törnliste
        </h2>
        <DataTable
          value={filteredTrips}
          className="mt-4"
          scrollable
          scrollHeight="400px"
          stripedRows
          size="small"
          emptyMessage="Keine Törns gefunden."
        >
          <Column
            header="Törn"
            body={(trip: Trip) => (
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-wide text-slate-400">
                  {new Date(trip.dateISO).toLocaleDateString("de-DE")}
                </span>
                <span className="font-semibold text-slate-900">{trip.title}</span>
              </div>
            )}
          />
          <Column
            field="distance"
            header="Distanz & Dauer"
            body={(trip: Trip) => (
              <div className="flex flex-col">
                <span className="font-medium text-slate-900">
                  {trip.distance.toFixed(1)} km
                </span>
                <span className="text-xs text-slate-500">{trip.duration}</span>
              </div>
            )}
          />
          <Column
            header="Status"
            body={(trip: Trip) => (
              <span
                className="trip-status-dot inline-flex h-3 w-3 rounded-full cursor-help"
                data-pr-tooltip={trip.status}
                data-pr-position="top"
                aria-label={trip.status}
                role="status"
                style={{ backgroundColor: statusToColor[trip.status] }}
              />
            )}
          />
          <Column
            header="Aktion"
            body={(trip: Trip) => (
              <Link
                href={`/trips/${trip.id}`}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-[var(--color-primary)] hover:border-[rgba(1,168,10,0.35)] hover:bg-[rgba(1,168,10,0.08)] hover:text-[var(--color-primary-strong)]"
              >
                Details
                <i className="pi pi-arrow-right" aria-hidden />
              </Link>
            )}
          />
        </DataTable>
      </Card>
    </div>
  );
}
