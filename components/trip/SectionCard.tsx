import { TripSection } from "@/lib/stores/trip-store";
import { Card } from "primereact/card";
import { Button } from "primereact/button";

interface SectionCardProps {
  section: TripSection;
  idx: number;
  getWindRotation: (dir: string) => number;
  getWeatherIcon: (precipitation: number) => {
    icon: string;
    color: string;
    label: string;
  };
  onEdit?: (section: TripSection) => void;
}

export function SectionCard({
  section,
  idx,
  getWindRotation,
  getWeatherIcon,
  onEdit,
}: SectionCardProps) {
  const rotation = getWindRotation(section.windDirection);
  const weather = getWeatherIcon(section.precipitation);

  return (
    <Card
      key={section.abschnittId}
      className="shadow-sm border border-gray-100 overflow-hidden mb-4"
    >
      <div className="flex flex-col gap-4 p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">
              Abschnitt {idx + 1}
            </h3>
            <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
              <i className="pi pi-clock text-xs"></i>
              <span suppressHydrationWarning>
                {new Date(section.start).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {" - "}
                {new Date(section.ende).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          {/* Weather Widgets */}
          <div className="flex flex-wrap items-center justify-end gap-3">
            <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg px-3 py-2 min-w-[70px]">
              <div
                className="bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-sm mb-1"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: "transform 0.3s ease-out",
                }}
              >
                <i className="pi pi-arrow-up text-gray-900 text-sm" />
              </div>
              <div className="text-xs font-bold text-gray-700">
                {section.windDirection}{" "}
                <span className="font-normal text-gray-500">
                  {section.windSpeed} Bft
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg px-3 py-2 min-w-[70px]">
              <div className="w-8 h-8 flex items-center justify-center mb-1">
                <i className={`pi ${weather.icon} ${weather.color} text-xl`} />
              </div>
              <div className="text-xs font-medium text-gray-600">
                {section.precipitation > 0
                  ? `${section.precipitation} mm`
                  : "Sonne"}
              </div>
            </div>
            {onEdit ? (
              <Button
                icon="pi pi-pencil"
                rounded
                text
                aria-label={`Abschnitt ${idx + 1} bearbeiten`}
                className="text-white! hover:text-(--color-primary)!"
                onClick={() => onEdit(section)}
              />
            ) : null}
          </div>
        </div>

        <hr className="border-gray-100" />

        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="bg-gray-50 rounded p-2">
            <div className="text-xs text-gray-400 uppercase">Distanz</div>
            <div className="font-semibold text-gray-800">
              {(
                section.motorKm +
                section.sailSeaKm +
                section.sailInlandKm
              ).toFixed(1)}{" "}
              km
            </div>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <div className="text-xs text-gray-400 uppercase">Motor</div>
            <div className="font-semibold text-gray-800">
              {section.motorKm.toFixed(1)} km
            </div>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <div className="text-xs text-gray-400 uppercase">Schleusen</div>
            <div className="font-semibold text-gray-800">
              {section.schleusen}
            </div>
          </div>
        </div>

        {section.crew.length > 0 && (
          <div className="mt-3 text-sm text-gray-700">
            <div className="text-xs uppercase text-gray-400 mb-1 flex items-center gap-2">
              <span>Crew</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {section.crew.map((person) => (
                <span
                  key={person.personId}
                  className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-700"
                >
                  {person.vorname} {person.nachname}
                  <span className="text-[10px] uppercase text-gray-500">
                    {person.rolle}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
