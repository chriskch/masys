"use client";

import { useMemo, useState } from "react";
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

type Trip = {
  id: string;
  title: string;
  boat: string;
  distance: number;
  duration: string;
  dateISO: string;
  start: string;
  target: string;
  crew: number;
  status: "Abgeschlossen" | "In Planung" | "Auswertung";
  ownerId: string;
};

const TRIPS: Trip[] = [
  {
    id: "TR-1093",
    title: "Abendregatta Elbe",
    boat: "Sun Odyssey 349",
    distance: 14.3,
    duration: "2 h 10 min",
    dateISO: "2024-06-12",
    start: "Wedel",
    target: "Norderelbe",
    crew: 4,
    status: "Abgeschlossen",
    ownerId: "me",
  },
  {
    id: "TR-1092",
    title: "Training – Spinnaker",
    boat: "Dehler 34",
    distance: 11.1,
    duration: "1 h 45 min",
    dateISO: "2024-06-09",
    start: "Hamburg",
    target: "Finkenwerder",
    crew: 3,
    status: "Auswertung",
    ownerId: "delegate-nils",
  },
  {
    id: "TR-1091",
    title: "Küstentörn Rügen",
    boat: "Bavaria C38",
    distance: 38.6,
    duration: "6 h 05 min",
    dateISO: "2024-06-07",
    start: "Sassnitz",
    target: "Lohme",
    crew: 5,
    status: "Abgeschlossen",
    ownerId: "delegate-mara",
  },
  {
    id: "TR-1088",
    title: "Nordsee Passage",
    boat: "Hanse 388",
    distance: 54.2,
    duration: "9 h 18 min",
    dateISO: "2024-05-31",
    start: "Cuxhaven",
    target: "Helgoland",
    crew: 6,
    status: "In Planung",
    ownerId: "me",
  },
];

const BOAT_OPTIONS = Array.from(new Set(TRIPS.map((trip) => trip.boat))).map(
  (boat) => ({ label: boat, value: boat }),
);

const ACCESSIBLE_PROFILES = [
  {
    value: "me",
    label: "Mein Profil",
    rights: "Lesen & Schreiben",
  },
  {
    value: "delegate-nils",
    label: "Nils Brenner",
    rights: "Lesen & Schreiben",
  },
  {
    value: "delegate-mara",
    label: "Mara Lenz",
    rights: "Lesen",
  },
];

const statusToColor: Record<Trip["status"], string> = {
  Abgeschlossen: "var(--color-primary)",
  "In Planung": "var(--color-accent-3)",
  Auswertung: "var(--color-accent-2)",
};

export default function TripsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [boat, setBoat] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [profileId, setProfileId] = useState(ACCESSIBLE_PROFILES[0]?.value ?? "me");

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

    return TRIPS.filter((trip) => {
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
  }, [searchTerm, boat, dateRange, profileId]);

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
      ACCESSIBLE_PROFILES.find((profile) => profile.value === profileId)
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
                  options={ACCESSIBLE_PROFILES.map((profile) => ({
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
                  options={BOAT_OPTIONS}
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
