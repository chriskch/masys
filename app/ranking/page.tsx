"use client";

import { useState } from "react";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";

type RankingEntry = {
  rank: number;
  name: string;
  points: number;
  distance: number;
  hours: number;
  isYou?: boolean;
};

const RANKING_DATA: RankingEntry[] = [
  { rank: 1, name: "Laura Vogt", points: 1540, distance: 712, hours: 96 },
  { rank: 2, name: "Nils Brenner", points: 1495, distance: 698, hours: 90 },
  { rank: 3, name: "Du", points: 1280, distance: 642, hours: 84, isYou: true },
  { rank: 4, name: "Kim Albrecht", points: 1255, distance: 618, hours: 78 },
  { rank: 5, name: "Tom Reimann", points: 1180, distance: 580, hours: 75 },
  { rank: 6, name: "Mara Lenz", points: 1135, distance: 551, hours: 73 },
];

const PERIOD_OPTIONS = [
  { label: "Aktueller Monat", value: "month" },
  { label: "Quartal", value: "quarter" },
  { label: "Gesamt", value: "all" },
];

export default function RankingPage() {
  const [periodFilter, setPeriodFilter] = useState<string>("month");

  const filteredRanking = RANKING_DATA;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
          Rangliste
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          Vereinsranking & Distanzübersicht
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Vergleiche deine Leistungen mit den anderen Crews im Brandenburger
          Segelverein. Deine Position ist hervorgehoben.
        </p>
      </header>

      <Card className="border-none !bg-white shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <label className="text-xs uppercase tracking-wide text-slate-400">
                Zeitraum
              </label>
              <Dropdown
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.value)}
                options={PERIOD_OPTIONS}
                className="mt-1 w-full"
              />
            </div>
          </div>
          <Tag
            value={
              periodFilter === "month"
                ? "Monatswertung"
                : periodFilter === "quarter"
                ? "Quartalswertung"
                : "Gesamtwertung"
            }
            severity="info"
            className="w-fit"
          />
        </div>
      </Card>

      <Card className="border-none !bg-white shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Leaderboard</h2>
        <DataTable
          value={filteredRanking}
          className="mt-4"
          stripedRows
          scrollable
          scrollHeight="400px"
          size="small"
          rowClassName={(entry: RankingEntry) =>
            entry.isYou ? "bg-sky-50 text-slate-900" : ""
          }
        >
          <Column field="rank" header="#" style={{ width: "3rem" }} />
          <Column field="name" header="Name" />
          <Column
            field="points"
            header="Punkte"
            body={(entry: RankingEntry) => `${entry.points.toLocaleString("de-DE")} P`}
          />
          <Column
            field="distance"
            header="Distanz"
            body={(entry: RankingEntry) => `${entry.distance.toFixed(0)} km`}
          />
          <Column
            field="hours"
            header="Stunden"
            body={(entry: RankingEntry) => `${entry.hours} h`}
          />
        </DataTable>
      </Card>
    </div>
  );
}
