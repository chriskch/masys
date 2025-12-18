import { Person } from "@/lib/stores/user-store";
import { Avatar } from "primereact/avatar";

interface CrewListProps {
  crew: Person[];
}

export function CrewList({ crew }: CrewListProps) {
  if (!crew || crew.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 italic text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
        Keine Crew eingetragen
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {crew.map((person) => (
        <div
          key={person.personId}
          className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all"
        >
          <Avatar
            label={person.vorname[0]}
            shape="circle"
            size="normal"
            className="bg-green-100 text-green-700 border border-green-200 font-bold shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-gray-900 truncate">
              {person.vorname} {person.nachname}
            </span>
            <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
              {person.rolle}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
