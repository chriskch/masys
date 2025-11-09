"use client";

import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { DISTANCE_RULES, BONUS_RULES } from "../../data/points-config";

const bonusCategoryLabels: Record<
  (typeof BONUS_RULES)[number]["category"],
  { title: string; description: string; severity: "info" | "success" | "warning" }
> = {
  operation: {
    title: "Manöver & Betrieb",
    description:
      "Aktionen, die während des Betriebs oder Manövriers stattfinden und zusätzliche Punkte verleihen.",
    severity: "info",
  },
  voyage: {
    title: "Törn-Boni",
    description:
      "Zusatzpunkte für besondere Reiseabschnitte, Langtörns oder Vereinsaktionen.",
    severity: "success",
  },
  volunteering: {
    title: "Ehrenamt & Engagement",
    description:
      "Punkte für Trainer*innen, Regatta-Funktionen und andere ehrenamtliche Aufgaben.",
    severity: "warning",
  },
};

export default function PointsRulesPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
          Punkte-Regelwerk
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          MASYS Punktevergabe im Überblick
        </h1>
        <p className="text-sm text-slate-500">
          Hier findest du alle Aktionen, die Punkte bringen. Die Regeln greifen
          automatisch beim Erfassen einer Fahrt und können dort als Parameter
          ausgewählt werden.
        </p>
      </header>

      <Card className="border-none !bg-white shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">
          Distanzbasierte Punkte
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Trage in der Fahrterfassung deine Kilometer nach Gewässertyp ein. Das
          System berechnet die Punkte automatisch.
        </p>
        <div className="mt-4 divide-y divide-slate-200">
          {DISTANCE_RULES.map((rule) => (
            <div
              key={rule.id}
              className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-slate-900">{rule.title}</p>
                <p className="text-sm text-slate-500">{rule.description}</p>
              </div>
              <Tag
                value={`${rule.pointsPerKm} Punkt${rule.pointsPerKm === 1 ? "" : "e"} pro km`}
                severity="info"
                className="w-fit"
              />
            </div>
          ))}
        </div>
      </Card>

      {Object.entries(
        BONUS_RULES.reduce(
          (acc, rule) => {
            const bucket = acc[rule.category] ?? [];
            bucket.push(rule);
            acc[rule.category] = bucket;
            return acc;
          },
          {} as Record<
            (typeof BONUS_RULES)[number]["category"],
            (typeof BONUS_RULES)[number][]
          >,
        ),
      ).map(([category, rules]) => {
        const meta = bonusCategoryLabels[category as keyof typeof bonusCategoryLabels];
        return (
          <Card
            key={category}
            className="border-none !bg-white shadow-sm"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">
                  {meta.title}
                </h2>
                <p className="text-sm text-slate-500">{meta.description}</p>
              </div>
              <Tag value="Bonus" severity={meta.severity} />
            </div>
            <div className="mt-4 divide-y divide-slate-200">
              {rules.map((rule) => {
                let pointsLabel: string;
                if (typeof rule.points === "number") {
                  pointsLabel = `${rule.points} Punkte`;
                } else {
                  const parts = [];
                  if (rule.points.perKm) {
                    parts.push(`${rule.points.perKm} Punkte pro km`);
                  }
                  if (rule.points.perOccurrence) {
                    parts.push(
                      `${rule.points.perOccurrence} Punkte pro ${rule.unitLabel}`,
                    );
                  }
                  pointsLabel = parts.join(" • ");
                }
                return (
                  <div
                    key={rule.id}
                    className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {rule.title}
                      </p>
                      <p className="text-sm text-slate-500">
                        {rule.description}
                      </p>
                    </div>
                    <Tag value={pointsLabel} className="w-fit" />
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}

    </div>
  );
}
