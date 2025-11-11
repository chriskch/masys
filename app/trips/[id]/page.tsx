"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";

type CrewMemberDetail = {
  name: string;
  role: string;
  isGuest: boolean;
  birthYear?: number;
  notes?: string;
};

type TripDetail = {
  id: string;
  title: string;
  date: string;
  start: string;
  destination: string;
  distance: string;
  duration: string;
  points: number;
  wind: string;
  weather: string;
  notes: string;
  crew: CrewMemberDetail[];
  status: "Abgeschlossen" | "Auswertung" | "In Planung";
};

const TRIP_DETAILS: Record<string, TripDetail> = {
  "TR-1093": {
    id: "TR-1093",
    title: "Abendregatta Elbe",
    date: "12. Juni 2024",
    start: "Wedel (SCW)",
    destination: "Norderelbe",
    distance: "14,3 km",
    duration: "2 h 10 min",
    points: 240,
    wind: "4 Bft NO",
    weather: "Leicht bewölkt, 18°C",
    notes:
      "Enge Kreuz zwischen Tonnen 13/15, schneller Spinnaker-Set auf dem Rückweg. Verbesserungspotenzial beim Startsignal.",
    crew: [
      { name: "Laura Vogt", role: "Skipper", isGuest: false, birthYear: 1994 },
      {
        name: "Nils Brenner",
        role: "Co-Skipper",
        isGuest: false,
        birthYear: 1992,
      },
      {
        name: "Kim Albrecht",
        role: "Crew",
        isGuest: true,
        birthYear: 2008,
        notes: "Trainingsprogramm Jugend",
      },
      {
        name: "Tom Reimann",
        role: "Crew",
        isGuest: true,
        birthYear: 2007,
      },
    ],
    status: "Abgeschlossen",
  },
  "TR-1092": {
    id: "TR-1092",
    title: "Training – Spinnaker",
    date: "09. Juni 2024",
    start: "Hamburg City Sporthafen",
    destination: "Finkenwerder",
    distance: "11,1 km",
    duration: "1 h 45 min",
    points: 165,
    wind: "3 Bft W",
    weather: "Sonne und leicht böig",
    notes:
      "Crew-Training Spinnaker-Set & Drop. Fokus auf Kommunikation beim Halsenmanöver.",
    crew: [
      { name: "Laura Vogt", role: "Skipper", isGuest: false, birthYear: 1994 },
      {
        name: "Kim Albrecht",
        role: "Crew",
        isGuest: true,
        birthYear: 2008,
        notes: "Noch ohne MASYS Account",
      },
      {
        name: "Sven Jansen",
        role: "Trainer:in",
        isGuest: true,
        birthYear: 2005,
      },
    ],
    status: "Auswertung",
  },
};

type TripDetailPageProps = {
  params: {
    id: string;
  };
};

const statusSeverity: Record<TripDetail["status"], "success" | "warning" | "info"> =
  {
    Abgeschlossen: "success",
    Auswertung: "warning",
    "In Planung": "info",
  };

export default function TripDetailPage({ params }: TripDetailPageProps) {
  const router = useRouter();
  const trip = useMemo(
    () => TRIP_DETAILS[params.id] ?? null,
    [params.id],
  );

  if (!trip) {
    return (
      <Card className="border-none !bg-white shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          Törn nicht gefunden
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Der gesuchte Törn existiert nicht oder wurde noch nicht synchronisiert.
        </p>
        <Link
          href="/trips"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)]"
        >
          <i className="pi pi-arrow-left" aria-hidden />
          Zur Törnliste
        </Link>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
            Törn #{trip.id}
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            {trip.title}
          </h1>
          <p className="text-sm text-slate-500">{trip.date}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            label="Bearbeiten"
            icon="pi pi-pencil"
            className="!rounded-full !border-none !bg-slate-200 !px-5 !py-3 !text-slate-700 hover:!bg-slate-300"
            onClick={() => router.push(`/trips/${trip.id}/edit`)}
          />
          <Button
            label="Törn löschen"
            icon="pi pi-trash"
            className="!rounded-full !border-none !bg-[var(--color-accent-5)] !px-5 !py-3 !text-white hover:!bg-[var(--color-accent-4)]"
            onClick={() => router.push("/trips")}
          />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border-none !bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <i className="pi pi-map-marker text-[var(--color-primary-strong)]" aria-hidden />
                {trip.start} → {trip.destination}
              </span>
              <span className="flex items-center gap-2">
                <i className="pi pi-route text-[var(--color-accent-2)]" aria-hidden />
                {trip.distance}
              </span>
              <span className="flex items-center gap-2">
                <i className="pi pi-clock text-[var(--color-primary)]" aria-hidden />
                {trip.duration}
              </span>
            </div>
            <Tag
              value={trip.status}
              severity={statusSeverity[trip.status]}
            />
          </div>

          <div className="mt-6 rounded-2xl bg-gradient-to-br from-[rgba(1,168,10,0.15)] via-white to-slate-200 p-6 text-center text-sm text-slate-600 shadow-inner">
            <p className="font-medium text-slate-700">
              Kartenansicht Platzhalter
            </p>
            <p className="mt-1 max-w-sm mx-auto">
              Integriere hier Leaflet, Mapbox oder eine andere Kartenbibliothek,
              um Track und Wegpunkte zu visualisieren.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Punkte
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {trip.points}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Wind & Wetter
              </p>
              <p className="mt-2 text-sm text-slate-600">{trip.wind}</p>
              <p className="text-xs text-slate-400">{trip.weather}</p>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-2xl font-semibold text-slate-900">
              Notizen
            </h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              {trip.notes}
            </p>
          </div>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="border-none !bg-white shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              Crew & Trainingsprofile
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Gastprofile werden mitgespeichert und können später einem Account
              zugeordnet werden, sobald sich Crewmitglieder registrieren oder
              volljährig sind.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {trip.crew.map((member, index) => (
                <div
                  key={`${member.name}-${index}`}
                  className="rounded-xl border border-slate-200 px-4 py-3"
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {member.name}
                      </p>
                      <p className="text-xs text-slate-500">{member.role}</p>
                      {member.notes ? (
                        <p className="mt-1 text-xs text-slate-400">
                          {member.notes}
                        </p>
                      ) : null}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 sm:mt-0">
                      <Tag
                        value={
                          member.isGuest
                            ? "Gastprofil (wird später verknüpft)"
                            : "Account verknüpft"
                        }
                        severity={member.isGuest ? "info" : "success"}
                      />
                      {member.birthYear ? (
                        <Tag
                          value={`Jg. ${member.birthYear}`}
                          className="!bg-slate-200 !text-slate-700"
                        />
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="border-none !bg-white shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Aktionen</h2>
            <div className="mt-4 flex flex-col gap-2 text-sm text-slate-600">
              <p className="flex items-center gap-2">
                <i className="pi pi-pencil" aria-hidden />
                Bearbeiten im Dialog (PrimeReact Dialog empfohlen)
              </p>
              <p className="flex items-center gap-2">
                <i className="pi pi-share-alt" aria-hidden />
                Törn als PDF oder Link teilen
              </p>
              <p className="flex items-center gap-2">
                <i className="pi pi-sync" aria-hidden />
                Synchronisation nach offline Nutzung anstoßen
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
