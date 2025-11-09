export type DistanceRule = {
  id: "inland" | "inlandOptimist" | "sea" | "upstream";
  title: string;
  description: string;
  pointsPerKm: number;
};

export type BonusRule = {
  id:
    | "engineKm"
    | "mastHandling"
    | "lock"
    | "longVoyageBase"
    | "longVoyageExtra"
    | "trailerTransport"
    | "communityEvent"
    | "youthTraining"
    | "regattaDuty";
  title: string;
  description: string;
  points:
    | number
    | {
        perKm?: number;
        perOccurrence?: number;
      };
  unitLabel: string;
  category: "operation" | "voyage" | "volunteering";
};

export const DISTANCE_RULES: DistanceRule[] = [
  {
    id: "inland",
    title: "Binnenfahrt",
    description:
      "Jeder gesegelte Kilometer auf Binnengewässern, inklusive gestakt, getreidelt oder gepaddelt.",
    pointsPerKm: 1,
  },
  {
    id: "inlandOptimist",
    title: "Binnenfahrt im Optimist",
    description:
      "Jeder gesegelte Kilometer mit einem Optimisten auf Binnengewässern.",
    pointsPerKm: 2,
  },
  {
    id: "sea",
    title: "Seefahrt",
    description: "Jeder gesegelte Kilometer auf See.",
    pointsPerKm: 1,
  },
  {
    id: "upstream",
    title: "Gegen den Strom",
    description:
      "Kilometer gegen Strömung von mindestens 5 km/h auf stark strömenden Gewässern.",
    pointsPerKm: 3,
  },
];

export const BONUS_RULES: BonusRule[] = [
  {
    id: "engineKm",
    title: "Motorfahrt",
    description:
      "Gefahrene Kilometer unter Motor, sowohl im Binnenbereich als auch auf See.",
    points: { perKm: 0.2 },
    unitLabel: "km",
    category: "operation",
  },
  {
    id: "mastHandling",
    title: "Mastlegen & Hindernisse",
    description: "Für Mastlegen und wieder Stellen bei Brücken oder Hindernissen.",
    points: { perOccurrence: 2 },
    unitLabel: "Vorgänge",
    category: "operation",
  },
  {
    id: "lock",
    title: "Schleusen",
    description: "Jede durchfahrene Schleuse.",
    points: { perOccurrence: 4 },
    unitLabel: "Schleusen",
    category: "operation",
  },
  {
    id: "longVoyageBase",
    title: "Langer Törn (200 km)",
    description:
      "Zusätzliche Punkte für zusammenhängende Langtörns über mehr als 200 km.",
    points: 20,
    unitLabel: "Langtörn > 200 km",
    category: "voyage",
  },
  {
    id: "longVoyageExtra",
    title: "Weitere 100 km beim Langtörn",
    description:
      "Zusatzpunkte für jede weiteren 100 km nach dem ersten 200 km Langtörn.",
    points: { perOccurrence: 10 },
    unitLabel: "weitere 100 km",
    category: "voyage",
  },
  {
    id: "trailerTransport",
    title: "Trailertransport",
    description:
      "Eigenständig durchgeführte Trailertransporte (mind. 150 km vom Heimathafen entfernt).",
    points: 50,
    unitLabel: "Transport",
    category: "voyage",
  },
  {
    id: "communityEvent",
    title: "Gemeinschaftsfahrt",
    description:
      "Teilnahme an vom Verein organisierten Gemeinschaftsfahrten (mind. 5 Boote). Punkte pro Tag.",
    points: 20,
    unitLabel: "Tage",
    category: "voyage",
  },
  {
    id: "youthTraining",
    title: "Kinder- & Jugendtraining",
    description:
      "Durchführung eines Trainings (2 Stunden oder mehr) als ehrenamtliche*r Trainer*in.",
    points: 25,
    unitLabel: "Trainingseinheiten",
    category: "volunteering",
  },
  {
    id: "regattaDuty",
    title: "Regatta-Funktion",
    description:
      "Offizielle Funktion bei ausgeschriebenen Regatten (ab 5 Stunden) pro Tag.",
    points: 25,
    unitLabel: "Regattatage",
    category: "volunteering",
  },
];
