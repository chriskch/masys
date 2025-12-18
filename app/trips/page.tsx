"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { useLogbookStore } from "../../lib/stores/logbook-store";
import { useSessionStore } from "../../lib/stores/session-store";
import type { Trip, LogbookStore } from "../../lib/stores/logbook-store";

const selectTripsSlice = (state: LogbookStore) => ({
  trips: state.trips,
  accounts: state.accounts,
  sections: state.sections,
});

export default function TripsPage() {
  const router = useRouter();
  const { trips, accounts, sections } = useLogbookStore(selectTripsSlice);
  const { currentAccountId } = useSessionStore((state) => ({
    currentAccountId: state.currentAccountId,
  }));
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);

  const sectionCountByTripId = useMemo(() => {
    const counts: Record<string, number> = {};
    sections.forEach((section) => {
      const tripId = `TR-${section.cruiseId}`;
      counts[tripId] = (counts[tripId] ?? 0) + 1;
    });
    return counts;
  }, [sections]);

  const filteredTrips = useMemo(() => {
    const [startDate, endDate] = dateRange;
    const startBound =
      startDate !== null
        ? new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate()
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
            999
          ).getTime()
        : null;

    return trips.filter((trip: Trip) => {
      const matchesSearch =
        trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProfile =
        trip.ownerId === currentAccountId ||
        trip.sharedOwnerIds.includes(currentAccountId);

      const tripTime = new Date(trip.dateISO).getTime();
      const matchesStart = startBound !== null ? tripTime >= startBound : true;
      const matchesEnd = endBound !== null ? tripTime <= endBound : true;

      return (
        matchesSearch &&
        matchesProfile &&
        matchesStart &&
        matchesEnd
      );
    });
  }, [searchTerm, dateRange, currentAccountId, trips]);

  const handleExport = () => {
    if (filteredTrips.length === 0) {
      return;
    }
    const header: string[] = [
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
    const rows: string[][] = filteredTrips.map((trip: Trip) => [
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
      .map((cols: string[]) =>
        cols.map((col: string) => `"${col.replace(/"/g, '""')}"`).join(";")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const profileLabel =
      accounts.find((account) => account.id === currentAccountId)?.name ??
      "profil";
    link.href = url;
    link.download = `toerns_${profileLabel
      .replace(/\s+/g, "_")
      .toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6">
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
          className="w-full justify-center rounded-full border-none bg-(--color-primary) px-5 py-3 text-base font-semibold text-white shadow-md hover:bg-(--color-primary-strong) sm:w-auto"
          onClick={() => router.push("/new-trip")}
        />
      </header>

      <Card className="border-none bg-white shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
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
          <Button
            label="Angezeigte Törns exportieren"
            icon="pi pi-download"
            className="w-full justify-center rounded-full border border-[rgba(1,168,10,0.4)] bg-white px-5 py-3 text-(--color-primary) hover:border-[rgba(1,168,10,0.6)] hover:bg-[rgba(1,168,10,0.05)] md:w-auto"
            onClick={handleExport}
            disabled={filteredTrips.length === 0}
          />
        </div>
      </Card>

      <Card className="border-none bg-white shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Törnliste</h2>
        <div className="mt-4 flex flex-col gap-3">
          {filteredTrips.length === 0 && (
            <p className="text-sm text-slate-500">Keine Törns gefunden.</p>
          )}
          {filteredTrips.map((trip: Trip) => {
            const sectionCount = sectionCountByTripId[trip.id] ?? 0;
            return (
              <Link
                key={trip.id}
                href={`/trips/${trip.id}`}
                className="flex flex-col gap-2 rounded-xl border border-slate-200 px-4 py-3 transition-colors hover:border-[rgba(1,168,10,0.35)] hover:bg-[rgba(1,168,10,0.08)] sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    {new Date(trip.dateISO).toLocaleDateString("de-DE")}
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {trip.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {trip.start} {"->"} {trip.target}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 sm:justify-end">
                  <span className="flex items-center gap-2">
                    <i
                      className="pi pi-list text-(--color-primary-strong)"
                      aria-hidden
                    />
                    {sectionCount} Abschnitte
                  </span>
                  <span className="flex items-center gap-2">
                    <i
                      className="pi pi-route text-(--color-primary-strong)"
                      aria-hidden
                    />
                    {trip.distance.toFixed(1)} km
                  </span>
                  <span className="flex items-center gap-2">
                    <i
                      className="pi pi-clock text-(--color-accent-3)"
                      aria-hidden
                    />
                    {trip.duration}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
