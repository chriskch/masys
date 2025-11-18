"use client";

import { Sidebar } from "primereact/sidebar";

type TipsSidebarProps = {
  visible: boolean;
  onHide: () => void;
};

export const TipsSidebar = ({ visible, onHide }: TipsSidebarProps) => (
  <Sidebar
    visible={visible}
    position="right"
    onHide={onHide}
    header="Offline & PWA Tipps"
    className="w-full sm:w-96"
  >
    <div className="flex flex-col gap-4 text-sm text-slate-600">
      <p>
        MASYS speichert deine Eingaben lokal, wenn keine Verbindung besteht.
        Sobald das Gerät wieder online ist, werden Törns automatisch
        synchronisiert.
      </p>
      <div className="rounded-xl border border-slate-200 px-4 py-3">
        <p className="font-semibold text-slate-900">Schneller Start im Fokus</p>
        <p className="mt-1">
          Schritt 1 konzentriert sich auf die wichtigsten Stammdaten, damit du
          in Sekunden loslegen kannst. Weitere Details kannst du später
          ergänzen.
        </p>
      </div>
      <div className="rounded-xl border border-slate-200 px-4 py-3">
        <p className="font-semibold text-slate-900">Offline Tipps</p>
        <ul className="mt-1 list-disc space-y-1 pl-5">
          <li>Tablet/Smartphone vor Abreise synchronisieren.</li>
          <li>GPS-Tracking läuft auch ohne Netz weiter.</li>
          <li>
            Crew kann via QR-Code oder Link hinzugefügt werden, sobald Verbindung
            verfügbar ist.
          </li>
        </ul>
      </div>
    </div>
  </Sidebar>
);
