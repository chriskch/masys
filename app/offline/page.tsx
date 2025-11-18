"use client";

import { useState } from "react";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { useOfflineStore } from "../../lib/stores/offline-store";

export default function OfflinePage() {
  const [syncing, setSyncing] = useState(false);
  const queuedTrips = useOfflineStore((state) => state.queuedTrips);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
          Offline
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          Offline gespeicherte Törns & Sync
        </h1>
        <p className="text-sm text-slate-500">
          Du bist aktuell offline. Deine letzten Törns werden lokal gesichert
          und können bei Netzverbindung synchronisiert werden.
        </p>
      </header>

      <Card className="border-none bg-white! shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Verbindungsstatus
              </p>
              <p className="text-xs text-slate-500">
                Alle Funktionen stehen im Offline-Modus zur Verfügung.
              </p>
            </div>
            <Tag value="Offline" severity="warning" />
          </div>
          <Button
            label={syncing ? "Synchronisiere..." : "Jetzt synchronisieren"}
            icon="pi pi-sync"
            className="w-full! rounded-full! border-none! bg-(--color-primary)! px-5! py-3! font-semibold! text-white! hover:bg-(--color-primary-strong)! sm:w-auto!"
            disabled={syncing}
            onClick={() => {
              setSyncing(true);
              setTimeout(() => setSyncing(false), 2000);
            }}
          />
        </div>
      </Card>

      <Card className="border-none bg-white! shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Lokale Törns</h2>
        <div className="mt-4 flex flex-col gap-3">
          {queuedTrips.map((trip) => (
            <div
              key={trip.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-600"
            >
              <div>
                <p className="font-semibold text-slate-900">{trip.title}</p>
                <p className="text-xs text-slate-400">{trip.createdAt}</p>
              </div>
              <Tag value="Bereit" severity="info" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
