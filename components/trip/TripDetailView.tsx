"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { SectionCard } from "@/components/trip/SectionCard";
import { SectionEditDialog } from "@/components/trip/SectionEditDialog";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Achievements } from "@/components/trip/Achievements";
import { ProgressSpinner } from "primereact/progressspinner";
import { useTripStore } from "@/lib/stores/trip-store";
import { getWindRotation } from "@/lib/utils/helpers";
import { useToast } from "@/lib/context/ToastContext";
import { useLogbookStore, type SectionEntry } from "@/lib/stores/logbook-store";
import { Dropdown } from "primereact/dropdown";
import { useSessionStore } from "@/lib/stores/session-store";
import { Message } from "primereact/message";

const getWeatherIcon = (precipitation: number) => {
  if (precipitation > 0) {
    return { icon: "pi-cloud", color: "text-blue-500", label: "Regen" };
  }
  return { icon: "pi-sun", color: "text-orange-500", label: "Trocken" };
};

interface Props {
  tripId: string;
}

export function TripDetailView({ tripId }: Props) {
  const { currentTrip, isLoading, fetchTrip } = useTripStore();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [ownershipAction, setOwnershipAction] = useState<"share" | "transfer">(
    "share"
  );
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null
  );
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const { showError } = useToast();
  const {
    shareTripOwnership,
    transferTripOwnership,
    accounts,
    sections: sectionEntries,
    sectionUsers,
    updateSection,
    setSectionUsers,
  } = useLogbookStore((state) => ({
    shareTripOwnership: state.shareTripOwnership,
    transferTripOwnership: state.transferTripOwnership,
    accounts: state.accounts,
    sections: state.sections,
    sectionUsers: state.sectionUsers,
    updateSection: state.updateSection,
    setSectionUsers: state.setSectionUsers,
  }));
  const { currentAccountId } = useSessionStore((state) => ({
    currentAccountId: state.currentAccountId,
  }));

  useEffect(() => {
    fetchTrip(tripId).catch((error) => {
      showError(error.message);
    });
  }, [tripId, fetchTrip, showError]);

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <ProgressSpinner />
      </div>
    );
  }

  if (!currentTrip) return null;

  // Use currentTrip data directly
  const {
    totalPoints,
    titel,
    startDate,
    startLocation,
    endLocation,
    attributes,
    sections,
    history,
    ownerId,
    sharedOwnerIds,
  } = currentTrip;

  // Tags
  const tags: string[] = [];
  if (attributes?.isRegatta) tags.push("Regatta");
  if (attributes?.isTraining) tags.push("Training");
  if (attributes?.isGroup) tags.push("Gemeinschaftsfahrt");

  const accountOptions = accounts
    .filter((acc) => acc.id !== ownerId)
    .map((acc) => ({
      label: `${acc.name}${acc.email ? ` (${acc.email})` : ""}`,
      value: acc.id,
    }));

  const accountName = (accountId: string | null) =>
    accountId
      ? accounts.find((acc) => acc.id === accountId)?.name ?? accountId
      : "Unbekannt";

  const canModifyOwnership =
    ownerId === currentAccountId || sharedOwnerIds.includes(currentAccountId);

  const handleOwnershipSave = async () => {
    if (!selectedAccountId) {
      showError("Bitte eine Segler:in auswählen.");
      return;
    }
    if (!canModifyOwnership) {
      showError("Keine Berechtigung, Ownership zu ändern.");
      return;
    }
    try {
      if (ownershipAction === "share") {
        shareTripOwnership(tripId, selectedAccountId, currentAccountId);
      } else {
        transferTripOwnership(tripId, selectedAccountId, currentAccountId);
      }
      await fetchTrip(tripId);
      setSelectedAccountId(null);
    } catch (error: unknown) {
      showError(
        error instanceof Error
          ? error.message
          : "Ownership konnte nicht aktualisiert werden."
      );
    }
  };

  const activeSectionEntry = editingSectionId
    ? sectionEntries.find((entry) => entry.sectionId === editingSectionId) ??
      null
    : null;

  const activeSectionIndex = editingSectionId
    ? sections.findIndex((section) => section.abschnittId === editingSectionId)
    : -1;

  const activeCrewUserIds = editingSectionId
    ? sectionUsers
        .filter((user) => user.sectionId === editingSectionId)
        .map((user) => user.userId)
    : [];

  const handleSectionSave = async (
    sectionId: number,
    updates: Partial<Omit<SectionEntry, "sectionId">>,
    crewUserIds: number[]
  ) => {
    updateSection(sectionId, updates);
    setSectionUsers(sectionId, crewUserIds);
    await fetchTrip(tripId);
    setEditingSectionId(null);
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 pb-20 p-4">
      {/* Header / Hero */}
      <div className="flex flex-col items-center text-center gap-2 pt-4">
        <div className="text-sm font-medium uppercase tracking-wider text-gray-500">
          Gesamtpunkte
        </div>
        <div className="text-6xl font-black text-green-600">
          {totalPoints?.toLocaleString("de-DE")}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">
          {titel || `Törn nach ${endLocation}`}
        </h1>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <i className="pi pi-calendar" />
          <span suppressHydrationWarning>
            {startDate ? new Date(startDate).toLocaleDateString("de-DE") : ""}
          </span>
          <span className="mx-1">•</span>
          <span>
            {startLocation} → {endLocation}
          </span>
        </div>

        <div className="flex gap-2 mt-2">
          {tags.map((tag) => (
            <Tag
              key={tag}
              value={tag}
              severity="info"
              className="rounded-4xl text-xs py-1 px-2"
            />
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <Achievements trip={currentTrip} />

      {/* Sections List */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1 gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-800">Abschnitte</h2>
            <span className="text-sm text-gray-500">
              {sections.length} Einträge
            </span>
          </div>
        </div>

        {sections.map((section, idx) => (
          <SectionCard
            key={section.abschnittId}
            section={section}
            idx={idx}
            getWindRotation={getWindRotation}
            getWeatherIcon={getWeatherIcon}
            onEdit={(target) => setEditingSectionId(target.abschnittId)}
          />
        ))}
      </div>

      {activeSectionEntry && (
        <SectionEditDialog
          open={!!editingSectionId}
          sectionEntry={activeSectionEntry}
          sectionIndex={activeSectionIndex >= 0 ? activeSectionIndex : 0}
          crewUserIds={activeCrewUserIds}
          accounts={accounts}
          onClose={() => setEditingSectionId(null)}
          onSave={({ updates, crewUserIds }) =>
            handleSectionSave(
              activeSectionEntry.sectionId,
              updates,
              crewUserIds
            )
          }
        />
      )}

      {/* Audit Log (Read-Only) - Custom Timeline Accordion */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <button
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          className="w-full flex items-center justify-between p-6 bg-white hover:bg-gray-50 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-800">
              Änderungshistorie
            </h2>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              Read-Only
            </span>
          </div>
          <i
            className={`pi pi-chevron-down text-gray-400 transition-transform duration-200 ${
              isHistoryOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isHistoryOpen && (
          <div className="border-t border-gray-100 bg-gray-50/50 p-6">
            <ul className="relative flex flex-col gap-6 ml-2">
              <div className="absolute left-[5px] top-2 bottom-2 w-px bg-gray-200"></div>

              {history.length > 0 ? (
                history.map((entry, idx) => (
                  <li
                    key={idx}
                    className="relative flex items-start gap-4 z-10"
                  >
                    <div className="w-3 h-3 rounded-full bg-gray-300 border-2 border-white mt-1.5 shrink-0" />

                    <div className="flex flex-col text-sm">
                      <span
                        className="text-gray-400 font-mono text-xs mb-0.5"
                        suppressHydrationWarning
                      >
                        {new Date(entry.timestamp).toLocaleString("de-DE", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="font-medium text-gray-700">
                        {entry.action}
                      </span>
                      <span className="text-xs text-gray-500">
                        durch {entry.user}
                      </span>
                    </div>
                  </li>
                ))
              ) : (
                <span className="text-gray-400 italic text-sm pl-4">
                  Keine Einträge vorhanden.
                </span>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Ownership */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <div className="flex items-center gap-2">
              <Tag
                value={`Owner: ${accountName(ownerId)}`}
                severity="success"
                className="rounded-full px-3 py-1 text-xs"
              />
              {sharedOwnerIds.length > 0 ? (
                <Tag
                  value={`Geteilt: ${sharedOwnerIds
                    .map((id) => accountName(id))
                    .join(", ")}`}
                  severity="info"
                  className="rounded-full px-3 py-1 text-xs"
                />
              ) : (
                <Tag
                  value="Keine geteilte Ownership"
                  severity="secondary"
                  className="rounded-full px-3 py-1 text-xs"
                />
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                label="Teilen"
                icon="pi pi-share-alt"
                outlined={ownershipAction !== "share"}
                onClick={() => setOwnershipAction("share")}
                size="small"
              />
              <Button
                label="Übertragen"
                icon="pi pi-exchange"
                outlined={ownershipAction !== "transfer"}
                onClick={() => setOwnershipAction("transfer")}
                size="small"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wide text-gray-500">
              Segler:in auswählen
            </label>
            <Dropdown
              value={selectedAccountId}
              options={accountOptions}
              onChange={(e) => setSelectedAccountId(e.value)}
              placeholder="Segler:in wählen"
              className="w-full"
              filter
              showClear
              disabled={!canModifyOwnership}
            />
          </div>
          <div className="flex justify-end">
            <Button
              label={
                ownershipAction === "transfer"
                  ? "Ownership übertragen"
                  : "Ownership teilen"
              }
              icon={
                ownershipAction === "transfer"
                  ? "pi pi-exchange"
                  : "pi pi-share-alt"
              }
              onClick={handleOwnershipSave}
              disabled={!selectedAccountId || !canModifyOwnership}
            />
          </div>
          {!canModifyOwnership && (
            <Message
              severity="warn"
              text="Keine Berechtigung: Nur Owner oder geteilte Owner dürfen ändern."
            />
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <Link href="/trips">
          <Button
            label="Zurück zur Übersicht"
            icon="pi pi-arrow-left"
            text
            severity="secondary"
            className="text-white! hover:text-(--color-primary)!"
          />
        </Link>
      </div>
    </div>
  );
}
