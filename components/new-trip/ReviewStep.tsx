"use client";

import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import type { TripFormState } from "../../app/new-trip/types";
import type { GpsTrack } from "../../lib/stores/logbook-store";
import { formatDurationMinutes } from "../../lib/stores/logbook-store";

export type PointsBreakdownItem = {
  id: string;
  label: string;
  points: number;
  detail: string;
};

type ReviewStepProps = {
  formData: TripFormState;
  pointsBreakdown: PointsBreakdownItem[];
  totalPoints: number;
  selectedTracks: GpsTrack[];
};

export const ReviewStep = ({
  formData,
  pointsBreakdown,
  totalPoints,
  selectedTracks,
}: ReviewStepProps) => (
  <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
    <Card className="border-none bg-white shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-900">
        Zusammenfassung & Punkte
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Verifiziere Crew, Distanzen und Zusatzaktionen. Anpassungen sind
        jederzeit möglich, auch nach dem Törn.
      </p>

      <div className="mt-4 grid gap-4">
        <div className="rounded-xl border border-slate-200 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Gesamtpunkte
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {totalPoints.toFixed(1)}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {pointsBreakdown.length === 0 ? (
            <p className="text-xs text-slate-500">
              Noch keine Punkte erfasst. Gehe zurück zu Schritt 3, um Kategorien
              auszuwählen.
            </p>
          ) : (
            pointsBreakdown.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.detail}</p>
                </div>
                <span className="text-sm font-semibold text-slate-700">
                  {item.points.toFixed(1)}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="rounded-xl border border-slate-200 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Crewübersicht
          </p>
          <div className="mt-2 flex flex-col gap-2 text-sm text-slate-600">
            {formData.crewMembers.length === 0 ? (
              <p className="text-xs text-slate-500">
                Noch keine Crew eingetragen.
              </p>
            ) : (
              formData.crewMembers.map((member) => (
                <div
                  key={`${member.name}-${member.role}`}
                  className="flex items-center justify-between"
                >
                  <span>{member.name}</span>
                  <div className="flex items-center gap-2 text-xs">
                    <Tag value={member.role} />
                    <Tag
                      value={member.isGuest ? "Gast" : "Account"}
                      severity={member.isGuest ? "info" : "success"}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Zugeordnete GPS-Tracks
          </p>
          {selectedTracks.length === 0 ? (
            <p className="mt-2 text-xs text-slate-500">
              Kein GPS-Track ausgewählt.
            </p>
          ) : (
            <div className="mt-2 flex flex-col gap-3">
              {selectedTracks.map((track) => (
                <div
                  key={track.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {track.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDurationMinutes(track.durationMinutes)} ·{" "}
                      {track.distanceKm.toFixed(1)} km ·{" "}
                      {new Date(track.startedAt).toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>

    <div className="flex flex-col gap-6">
      <Card className="border-none bg-white shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">
          Touch-optimierte Aktionen
        </h2>
        <div className="mt-4 flex flex-col gap-3 text-sm text-slate-600">
          <p className="flex items-center gap-2">
            <i
              className="pi pi-map-marker text-(--color-primary)"
              aria-hidden
            />
            Wegpunkte können direkt aus der Kartenansicht übernommen werden.
          </p>
          <p className="flex items-center gap-2">
            <i
              className="pi pi-cloud-download text-(--color-accent-2)"
              aria-hidden
            />
            Offline gezeichnete Tracks werden automatisch synchronisiert.
          </p>
          <p className="flex items-center gap-2">
            <i
              className="pi pi-users text-(--color-accent-3)"
              aria-hidden
            />
            Crew kann via QR-Code oder Link eingeladen werden.
          </p>
        </div>
      </Card>
    </div>
  </div>
);
