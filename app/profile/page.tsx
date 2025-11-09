"use client";

import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Avatar } from "primereact/avatar";
import { Tag } from "primereact/tag";
import { ToggleButton } from "primereact/togglebutton";
import { useState } from "react";

const badgeList = [
  { title: "Sturmbezwinger", description: "10 Fahrten bei >5 Bft absolviert", icon: "pi pi-bolt" },
  { title: "Navigator", description: "250 km ohne Kursabweichung", icon: "pi pi-compass" },
  { title: "Crew Leader", description: "20 Crew-Mitglieder mitgenommen", icon: "pi pi-users" },
];

const stats = [
  { label: "Gesamtpunkte", value: "1.280" },
  { label: "Distanz", value: "642 km" },
  { label: "Segelstunden", value: "84 h" },
  { label: "Fahrten dieses Jahr", value: "18" },
];

export default function ProfilePage() {
  const router = useRouter();
  const [offlineMode, setOfflineMode] = useState(true);
  const [unitMetric, setUnitMetric] = useState(true);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <Avatar
            label="LV"
            className="!h-16 !w-16 !bg-sky-600 !text-lg !font-semibold !text-white"
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

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border-none !bg-white shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">Badges</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {badgeList.map((badge) => (
              <div
                key={badge.title}
                className="flex flex-col gap-2 rounded-xl border border-slate-200 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-sky-100 p-3 text-sky-600">
                    <i className={badge.icon} aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {badge.title}
                    </p>
                    <p className="text-xs text-slate-500">{badge.description}</p>
                  </div>
                </div>
                <Tag value="Aktiv" severity="success" />
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-none !bg-white shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">Einstellungen</h2>
          <div className="mt-4 flex flex-col gap-4 text-sm text-slate-600">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-slate-900">Offline Modus</p>
                <p className="text-xs text-slate-500">
                  Fahrten lokal speichern und später synchronisieren.
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
