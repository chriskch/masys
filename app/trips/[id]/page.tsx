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

type TripMetric = {
  label: string;
  value: string;
  description: string;
};

type TripSegmentDetail = {
  title: string;
  distance: string;
  focus: string;
  takeaway: string;
};

type TripTimelineItem = {
  time: string;
  title: string;
  description: string;
  icon: string;
};

type TripAttachment = {
  icon: string;
  label: string;
  description: string;
  actionLabel?: string;
};

type TripConditions = {
  tide: string;
  seaState: string;
  waterTemp: string;
  visibility: string;
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
  segments: TripSegmentDetail[];
  timeline: TripTimelineItem[];
  metrics: TripMetric[];
  highlights: string[];
  attachments: TripAttachment[];
  coachNote: string;
  conditions: TripConditions;
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
    segments: [
      {
        title: "Start Wedel → Tonne 13",
        distance: "4,8 km",
        focus: "Kreuz im engen Fahrwasser & saubere Laylines",
        takeaway:
          "Sehr konsequente Kommunikation, dennoch 4 s hinter Referenzstart.",
      },
      {
        title: "Regatta-Feld",
        distance: "6,2 km",
        focus: "Spinnaker-Set mit anschließendem Vorwind",
        takeaway:
          "Spinnaker innerhalb von 90 s gesetzt, nächster Sprint noch koordinierter fahren.",
      },
      {
        title: "Rückweg",
        distance: "3,3 km",
        focus: "Schlag zurück gegen ablaufenden Strom",
        takeaway:
          "Gute Nutzung der Abdeckung, 0,3 kn Zeitvorteil herausgesegelt.",
      },
    ],
    timeline: [
      {
        time: "17:35",
        title: "Crew-Briefing",
        description:
          "Kurzbesprechung Notfälle, Rollenzuteilung und neue Jugend-Crew vorgestellt.",
        icon: "pi-users",
      },
      {
        time: "18:10",
        title: "Startsignal",
        description: "3. Position über die Linie, 4 s hinter Pistole, Spinnaker bereit.",
        icon: "pi-flag",
      },
      {
        time: "19:05",
        title: "Spinnaker-Set",
        description:
          "Kim übernahm Vorschiff, Set in 90 s abgeschlossen. Kommunikation sehr ruhig.",
        icon: "pi-send",
      },
      {
        time: "19:40",
        title: "Zieldurchgang",
        description:
          "Platz 2 im Feld. Abschlussfeedback direkt nach dem Bergen des Segels gesammelt.",
        icon: "pi-check-circle",
      },
    ],
    metrics: [
      {
        label: "Boot",
        value: "Sun Odyssey 349",
        description: "Leichtes Regattalayout, 110% Genua",
      },
      {
        label: "Crew",
        value: "4 Personen",
        description: "2 Stammcrew · 2 Gäste",
      },
      {
        label: "Windkurs",
        value: "NO ↦ SO",
        description: "2x Kreuz, 1x Vorwind",
      },
      {
        label: "Tracking",
        value: "TRACK-1093",
        description: "16,4 km GPS-Aufzeichnung",
      },
    ],
    highlights: [
      "Spinnaker-Set in persönlicher Bestzeit",
      "Startsequenz enger an die Pistole legen",
    ],
    attachments: [
      {
        icon: "pi-directions",
        label: "GPS Track",
        description: "TRACK-1093 · 16,4 km",
        actionLabel: "Öffnen",
      },
      {
        icon: "pi-image",
        label: "Manöverfotos",
        description: "6 Dateien aus Drive-Ordner Abendregatta",
        actionLabel: "Ansehen",
      },
      {
        icon: "pi-file-edit",
        label: "Crew-Feedback",
        description: "Notizen aus Kurzdebriefing",
        actionLabel: "Lesen",
      },
    ],
    coachNote:
      "Beim Kreuzschlag konsequent übermitteln, wer an der Layline ist. Gäste frühzeitig in den Rollcall einbinden.",
    conditions: {
      tide: "Ablaufend, +0,6 kn",
      seaState: "0,8 m kurze Welle",
      waterTemp: "Elbe 18°C",
      visibility: "8 km, leichter Dunst",
    },
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
    segments: [
      {
        title: "Warm-up",
        distance: "2,5 km",
        focus: "Aufschießer & Rollmanöver",
        takeaway: "Kim sicher im Vorschiff platziert, Trainerfeedback direkt eingearbeitet.",
      },
      {
        title: "Spi-Set & Drop",
        distance: "5,1 km",
        focus: "Setzen auf Vorwindkurs, Drop mit Einpicken",
        takeaway: "Drop sauber, beim Setzen fehlten 10 s. Timing mit Trainer nachschärfen.",
      },
      {
        title: "Halsendrills",
        distance: "3,5 km",
        focus: "Serien aus 4 Halsen",
        takeaway:
          "Kommunikation zwischen Pinne und Vorschiff ausbauen, Trainer hat Zusatzübung empfohlen.",
      },
    ],
    timeline: [
      {
        time: "14:10",
        title: "Briefing",
        description: "Sven stellt neues Spi-Protokoll vor.",
        icon: "pi-comments",
      },
      {
        time: "14:40",
        title: "Set 1",
        description: "Spi steht, Kurs stabil – Fokus lag auf Energie halten.",
        icon: "pi-send",
      },
      {
        time: "15:05",
        title: "Drill-Serie",
        description: "4 Halsen nacheinander, Crew bleibt ruhig.",
        icon: "pi-refresh",
      },
      {
        time: "15:35",
        title: "Debrief",
        description: "Aufgabe für Heimtraining verteilt.",
        icon: "pi-star",
      },
    ],
    metrics: [
      {
        label: "Boot",
        value: "Dehler 34",
        description: "Trainingstrimm Mittelwind",
      },
      {
        label: "Crew",
        value: "3 Personen",
        description: "1 Trainer:in · 2 Crew",
      },
      {
        label: "Windkurs",
        value: "W ↦ SW",
        description: "Training mit Böen bis 18 kn",
      },
      {
        label: "Tracking",
        value: "TRACK-1092",
        description: "12,1 km GPS-Aufzeichnung",
      },
    ],
    highlights: [
      "Drop-Sequence funktioniert blind.",
      "Timing für den Spi-Set noch inkonsistent.",
    ],
    attachments: [
      {
        icon: "pi-directions",
        label: "GPS Track",
        description: "TRACK-1092 · 12,1 km",
        actionLabel: "Öffnen",
      },
      {
        icon: "pi-book",
        label: "Trainer:in Aufgaben",
        description: "PDF mit Drill-Beschreibung",
        actionLabel: "Download",
      },
    ],
    coachNote:
      "Weiterhin Fokus auf ruhige Ansagen beim Halsen. Nächste Einheit Trainerwechsel testen.",
    conditions: {
      tide: "Stillwasser",
      seaState: "Flachwasser, leichte Kabbelwelle",
      waterTemp: "19°C",
      visibility: "Sehr gut",
    },
  },
};

type TripDetailPageProps = {
  params: {
    id: string;
  };
};

const statusSeverity: Record<TripDetail["status"], "success" | "warning" | "info"> = {
  Abgeschlossen: "success",
  Auswertung: "warning",
  "In Planung": "info",
};

export default function TripDetailPage({ params }: TripDetailPageProps) {
  const router = useRouter();
  const trip = useMemo(() => TRIP_DETAILS[params.id] ?? null, [params.id]);

  if (!trip) {
    return (
      <Card className="border-none bg-white shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          Törn nicht gefunden
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Der gesuchte Törn existiert nicht oder wurde noch nicht
          synchronisiert.
        </p>
        <Link
          href="/trips"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-(--color-primary)"
        >
          <i className="pi pi-arrow-left" aria-hidden />
          Zur Törnliste
        </Link>
      </Card>
    );
  }

  const statBlocks = [
    { label: "Distanz", value: trip.distance },
    { label: "Dauer", value: trip.duration },
    { label: "Crew", value: `${trip.crew.length} Personen` },
    { label: "Punkte", value: `${trip.points}` },
  ];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 border-b border-slate-100 pb-4">
        <Link
          href="/trips"
          className="inline-flex items-center gap-2 text-xs font-semibold text-(--color-primary)"
        >
          <i className="pi pi-arrow-left" aria-hidden />
          Zur Törnliste
        </Link>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
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
              className="w-full justify-center rounded-full border-none bg-slate-200 px-5 py-3 text-slate-700 hover:bg-slate-300 sm:w-auto"
              onClick={() => router.push(`/trips/${trip.id}/edit`)}
            />
            <Button
              label="Törn löschen"
              icon="pi pi-trash"
              className="w-full justify-center rounded-full border-none bg-(--color-accent-5) px-5 py-3 text-white hover:bg-(--color-accent-4) sm:w-auto"
              onClick={() => router.push("/trips")}
            />
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-6">
          <Card className="border-none bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-2">
                  <i
                    className="pi pi-map-marker text-(--color-primary-strong)"
                    aria-hidden
                  />
                  {trip.start} → {trip.destination}
                </span>
                <span className="flex items-center gap-2">
                  <i className="pi pi-route text-(--color-accent-2)" aria-hidden />
                  {trip.distance}
                </span>
                <span className="flex items-center gap-2">
                  <i className="pi pi-clock text-(--color-primary)" aria-hidden />
                  {trip.duration}
                </span>
              </div>
              <Tag value={trip.status} severity={statusSeverity[trip.status]} />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {statBlocks.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-slate-100 px-4 py-3 shadow-sm"
                >
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-linear-to-br from-[rgba(1,168,10,0.15)] via-white to-slate-100 p-6 text-center text-sm text-slate-600">
              <p className="font-semibold text-slate-800">Kartenansicht</p>
              <p className="mt-1">
                Hier Track und Wegpunkte darstellen. Leaflet, Mapbox oder eine
                Vereinskarte lassen sich einfach anbinden.
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {trip.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-slate-200 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]"
                >
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {metric.value}
                  </p>
                  <p className="text-xs text-slate-500">{metric.description}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="border-none bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-slate-900">
                Abschnitte & Manöver
              </h2>
              <span className="text-xs uppercase tracking-wide text-slate-400">
                {trip.segments.length} Abschnitte
              </span>
            </div>
            <div className="mt-4 flex flex-col gap-4">
              {trip.segments.map((segment, index) => (
                <div
                  key={`${segment.title}-${index}`}
                  className="rounded-2xl border border-slate-100 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">
                      {index + 1}. {segment.title}
                    </p>
                    <span className="rounded-full bg-[rgba(1,168,10,0.08)] px-3 py-1 text-xs font-semibold text-(--color-primary)">
                      {segment.distance}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Fokus
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {segment.focus}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Erkenntnis
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {segment.takeaway}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="border-none bg-white shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              Ablauf & Learnings
            </h2>
            <div className="mt-4 flex flex-col gap-4">
              {trip.timeline.map((item, index) => (
                <div
                  key={`${item.title}-${index}`}
                  className="rounded-2xl border border-slate-100 p-4 shadow-sm"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-(--color-primary)">
                    {item.time}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <i className={`pi ${item.icon} text-(--color-primary)`} aria-hidden />
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="border-none bg-white shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              Logbuch & Erkenntnisse
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {trip.notes}
            </p>
            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Highlights
              </p>
              <ul className="mt-2 list-disc pl-5 text-sm text-slate-600">
                {trip.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="border-none bg-white shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              Crew & Trainingsprofile
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Gastprofile werden gespeichert und können später verknüpft werden,
              sobald Accounts angelegt sind.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {trip.crew.map((member, index) => (
                <div
                  key={`${member.name}-${index}`}
                  className="rounded-2xl border border-slate-100 px-4 py-3"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
                    <div className="flex flex-wrap items-center gap-2">
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
                          className="bg-slate-200 text-slate-700"
                        />
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="border-none bg-white shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              Wetter & Bedingungen
            </h2>
            <div className="mt-4 grid gap-3 text-sm text-slate-600">
              <div className="rounded-2xl border border-slate-100 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Wind
                </p>
                <p className="text-sm font-semibold text-slate-800">
                  {trip.wind}
                </p>
                <p className="text-xs text-slate-500">{trip.weather}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Tide
                </p>
                <p className="text-sm text-slate-600">{trip.conditions.tide}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Seezustand
                </p>
                <p className="text-sm text-slate-600">{trip.conditions.seaState}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Wasser & Sicht
                </p>
                <p className="text-sm text-slate-600">
                  {trip.conditions.waterTemp}
                </p>
                <p className="text-xs text-slate-500">
                  Sicht: {trip.conditions.visibility}
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-dashed border-(--color-primary) bg-[rgba(1,168,10,0.05)] p-4">
              <p className="text-xs uppercase tracking-wide text-(--color-primary)">
                Trainer:innen-Notiz
              </p>
              <p className="mt-2 text-sm text-slate-700">{trip.coachNote}</p>
            </div>
          </Card>

          <Card className="border-none bg-white shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              Unterlagen & Aktionen
            </h2>
            <div className="mt-4 flex flex-col gap-3">
              {trip.attachments.map((attachment, index) => (
                <div
                  key={`${attachment.label}-${index}`}
                  className="flex items-start gap-3 rounded-2xl border border-slate-100 p-3"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(1,168,10,0.08)] text-(--color-primary)">
                    <i className={`pi ${attachment.icon} text-base`} aria-hidden />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {attachment.label}
                    </p>
                    <p className="text-xs text-slate-500">
                      {attachment.description}
                    </p>
                  </div>
                  {attachment.actionLabel ? (
                    <Button
                      label={attachment.actionLabel}
                      text
                      className="text-(--color-primary)!"
                    />
                  ) : null}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
