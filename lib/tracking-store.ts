export type GpsTrack = {
  id: string;
  title: string;
  startedAt: string;
  durationMinutes: number;
  distanceKm: number;
};

const initialTracks: GpsTrack[] = [
  {
    id: "TRACK-1093",
    title: "Abendrunde Havel",
    startedAt: "2024-06-12T18:05:00.000Z",
    durationMinutes: 85,
    distanceKm: 16.4,
  },
  {
    id: "TRACK-1092",
    title: "Training Spinnaker",
    startedAt: "2024-06-09T14:15:00.000Z",
    durationMinutes: 70,
    distanceKm: 12.1,
  },
  {
    id: "TRACK-1091",
    title: "Küstentörn Rügen",
    startedAt: "2024-06-07T09:00:00.000Z",
    durationMinutes: 365,
    distanceKm: 58.4,
  },
];

type Subscriber = () => void;

let tracks = [...initialTracks];
const subscribers = new Set<Subscriber>();

const emitChange = () => {
  subscribers.forEach((listener) => listener());
};

export const trackingStore = {
  subscribe(listener: Subscriber) {
    subscribers.add(listener);
    return () => subscribers.delete(listener);
  },
  getSnapshot() {
    return tracks;
  },
  getServerSnapshot() {
    return initialTracks;
  },
  addTrack(track: GpsTrack) {
    tracks = [track, ...tracks];
    emitChange();
  },
  removeTrack(id: string) {
    tracks = tracks.filter((track) => track.id !== id);
    emitChange();
  },
};

export const formatDurationMinutes = (minutes: number) => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hrs > 0 ? `${hrs} h ${mins} min` : `${mins} min`;
};
