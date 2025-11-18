"use client";

import Link from "next/link";
import { Button } from "primereact/button";

type NewTripHeaderProps = {
  onOpenTips: () => void;
};

export const NewTripHeader = ({ onOpenTips }: NewTripHeaderProps) => (
  <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
    <div className="flex-1">
      <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
        Törn starten
      </p>
      <h1 className="text-3xl font-semibold text-slate-900">
        Neuen Törn anlegen oder Tracking starten
      </h1>
      <p className="text-sm text-slate-500">
        Vier übersichtliche Schritte: Stammdaten erfassen, Crew organisieren,
        Punkte festlegen und alles final prüfen.
      </p>
      <Link
        href="/points"
        className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-(--color-primary)"
      >
        <i className="pi pi-external-link" aria-hidden />
        Punkte-Regelwerk ansehen
      </Link>
    </div>
    <Button
      type="button"
      icon="pi pi-info-circle"
      rounded
      aria-label="Offline & PWA Tipps"
      className="h-11 w-11 border-none bg-[rgba(1,168,10,0.12)] text-(--color-primary) hover:bg-[rgba(1,168,10,0.2)]"
      onClick={onOpenTips}
    />
  </header>
);
