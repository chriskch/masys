"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { ProgressBar } from "primereact/progressbar";
import { Avatar } from "primereact/avatar";
import { Tag } from "primereact/tag";

const stats = [
  { label: "Gesamtpunkte", value: "1.280", icon: "pi pi-star", accent: "bg-orange-100 text-orange-500" },
  { label: "Seemeilen", value: "642 km", icon: "pi pi-compass", accent: "bg-sky-100 text-sky-600" },
  { label: "Segelstunden", value: "84 h", icon: "pi pi-clock", accent: "bg-indigo-100 text-indigo-600" },
  { label: "Crewtage", value: "36", icon: "pi pi-users", accent: "bg-emerald-100 text-emerald-600" },
];

const recentTrips = [
  {
    id: "TR-1093",
    title: "Abendregatta Elbe",
    date: "12. Juni 2024",
    distance: "14,3 km",
    duration: "2 h 10 min",
    status: "Abgeschlossen",
  },
  {
    id: "TR-1092",
    title: "Training – Spinnaker",
    date: "09. Juni 2024",
    distance: "11,1 km",
    duration: "1 h 45 min",
    status: "Auswertung",
  },
  {
    id: "TR-1091",
    title: "Küstenfahrt Rügen",
    date: "07. Juni 2024",
    distance: "38,6 km",
    duration: "6 h 05 min",
    status: "Abgeschlossen",
  },
];

const progressGoals = [
  { title: "Monatsziel km", current: 64, target: 90 },
  { title: "Crew Sessions", current: 6, target: 8 },
  { title: "Punkte Mission", current: 1280, target: 1500 },
];

const leaderboardPreview = [
  { rank: 1, name: "Laura Vogt", points: 1540, distance: "712 km" },
  { rank: 2, name: "Nils Brenner", points: 1495, distance: "698 km" },
  { rank: 3, name: "Du", points: 1280, distance: "642 km", highlight: true },
];

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
            Dashboard
          </p>
          <h1 className="mt-1 text-4xl font-semibold text-slate-900">
            Willkommen zurück, Skipper!
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Behalte deine Fortschritte im Blick und starte in weniger als zwei
            Klicks deine nächste Fahrt.
          </p>
        </div>
        <Button
          label="Neue Fahrt starten"
          icon="pi pi-plus"
          className="!w-full !justify-center !rounded-full !border-none !bg-sky-600 !px-5 !py-3 !text-base !font-semibold !text-white shadow-md hover:!bg-sky-700 sm:!w-auto"
          onClick={() => router.push("/new-trip")}
        />
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none !bg-white shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  {stat.label}
                </p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {stat.value}
                </p>
              </div>
              <span
                className={`rounded-full p-3 text-xl shadow-inner ${stat.accent}`}
              >
                <i className={stat.icon} aria-hidden />
              </span>
            </div>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border-none !bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-900">
              Letzte Fahrten
            </h2>
            <Link
              href="/trips"
              className="text-sm font-medium text-sky-600 hover:text-sky-700"
            >
              Alle anzeigen
            </Link>
          </div>
          <div className="mt-5 flex flex-col gap-4">
            {recentTrips.map((trip) => (
              <Link
                key={trip.id}
                href={`/trips/${trip.id}`}
                className="flex items-start justify-between rounded-xl border border-slate-200 px-4 py-3 transition-colors hover:border-sky-200 hover:bg-sky-50"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {trip.title}
                  </p>
                  <p className="text-xs text-slate-500">{trip.date}</p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-2">
                      <i className="pi pi-route text-sky-500" aria-hidden />
                      {trip.distance}
                    </span>
                    <span className="flex items-center gap-2">
                      <i className="pi pi-clock text-indigo-500" aria-hidden />
                      {trip.duration}
                    </span>
                  </div>
                </div>
                <Tag
                  value={trip.status}
                  severity={trip.status === "Abgeschlossen" ? "success" : "info"}
                />
              </Link>
            ))}
          </div>
        </Card>

        <Card className="border-none !bg-white shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">
            Fortschrittsziele
          </h2>
          <div className="mt-6 flex flex-col gap-6">
            {progressGoals.map((goal) => {
              const percentage = Math.min(
                100,
                Math.round((goal.current / goal.target) * 100),
              );
              return (
                <div key={goal.title}>
                  <p className="text-sm font-medium text-slate-700">
                    {goal.title}
                    <span className="ml-2 text-xs text-slate-400">
                      {goal.current} / {goal.target}
                    </span>
                  </p>
                  <ProgressBar
                    value={percentage}
                    showValue
                    className="mt-2"
                  />
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      <Card className="border-none !bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Leaderboard Vorschau
          </h2>
          <p className="text-sm text-slate-500">
            Bleib dran, um deinen Platz im Ranking des Brandenburger Segelvereins zu sichern.
          </p>
          </div>
          <Link
            href="/ranking"
            className="text-sm font-medium text-sky-600 hover:text-sky-700"
          >
            Zur Rangliste
          </Link>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {leaderboardPreview.map((entry) => (
            <div
              key={entry.rank}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition-colors ${
                entry.highlight
                  ? "border-sky-200 bg-sky-50 text-slate-900"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-slate-400">
                  #{entry.rank}
                </span>
                <Avatar
                  label={entry.name
                    .split(" ")
                    .map((token) => token[0])
                    .join("")
                    .slice(0, 2)}
                  className={`!bg-slate-200 !text-slate-700 ${
                    entry.highlight ? "!bg-sky-500 !text-white" : ""
                  }`}
                />
                <div>
                  <p className="font-semibold text-slate-900">{entry.name}</p>
                  <p className="text-xs text-slate-500">Brandenburger Segelverein</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-xs text-slate-500">
                <span className="flex items-center gap-2">
                  <i className="pi pi-star text-orange-400" aria-hidden />
                  {entry.points} Punkte
                </span>
                <span className="flex items-center gap-2">
                  <i className="pi pi-route text-sky-400" aria-hidden />
                  {entry.distance}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
