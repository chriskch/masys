"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Avatar } from "primereact/avatar";
import { Tag } from "primereact/tag";

const stats = [
  {
    label: "Gesamtpunkte",
    value: "1.280",
    icon: "pi pi-star",
    accent: "bg-[rgba(1,168,10,0.15)] text-[var(--color-primary)]",
  },
  {
    label: "Seemeilen",
    value: "642 km",
    icon: "pi pi-compass",
    accent: "bg-[rgba(1,168,93,0.15)] text-[var(--color-primary-strong)]",
  },
  {
    label: "Segelstunden",
    value: "84 h",
    icon: "pi pi-clock",
    accent: "bg-[rgba(1,159,168,0.15)] text-[#019fa8]",
  },
  {
    label: "Crewtage",
    value: "36",
    icon: "pi pi-users",
    accent: "bg-[rgba(94,1,168,0.15)] text-[#5e01a8]",
  },
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
    title: "Küstentörn Rügen",
    date: "07. Juni 2024",
    distance: "38,6 km",
    duration: "6 h 05 min",
    status: "Abgeschlossen",
  },
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
            Klicks deinen nächsten Törn.
          </p>
        </div>
        <Button
          label="Neuen Törn starten"
          icon="pi pi-plus"
          className="!w-full !justify-center !rounded-full !border-none !bg-[var(--color-primary)] !px-5 !py-3 !text-base !font-semibold !text-white shadow-md hover:!bg-[var(--color-primary-strong)] sm:!w-auto"
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

      <section className="grid gap-6">
        <Card className="border-none !bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-900">
              Letzte Törns
            </h2>
            <Link
              href="/trips"
              className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-strong)]"
            >
              Alle anzeigen
            </Link>
          </div>
          <div className="mt-5 flex flex-col gap-4">
            {recentTrips.map((trip) => (
              <Link
                key={trip.id}
                href={`/trips/${trip.id}`}
                className="flex items-start justify-between rounded-xl border border-slate-200 px-4 py-3 transition-colors hover:border-[rgba(1,168,10,0.35)] hover:bg-[rgba(1,168,10,0.08)]"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {trip.title}
                  </p>
                  <p className="text-xs text-slate-500">{trip.date}</p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-2">
                  <i className="pi pi-route text-[var(--color-primary-strong)]" aria-hidden />
                      {trip.distance}
                    </span>
                    <span className="flex items-center gap-2">
                      <i className="pi pi-clock text-[var(--color-accent-3)]" aria-hidden />
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
            className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-strong)]"
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
                  ? "border-[rgba(1,168,10,0.35)] bg-[rgba(1,168,10,0.08)] text-slate-900"
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
                    entry.highlight ? "!bg-[var(--color-primary)] !text-white" : ""
                  }`}
                />
                <div>
                  <p className="font-semibold text-slate-900">{entry.name}</p>
                  <p className="text-xs text-slate-500">Brandenburger Segelverein</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-xs text-slate-500">
                <span className="flex items-center gap-2">
                  <i className="pi pi-star text-[var(--color-primary)]" aria-hidden />
                  {entry.points} Punkte
                </span>
                <span className="flex items-center gap-2">
                  <i className="pi pi-route text-[var(--color-accent-2)]" aria-hidden />
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
