import { TripDetailView } from "@/components/trip/TripDetailView";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TripDetailPage({ params }: PageProps) {
  const { id } = await params;

  return <TripDetailView tripId={id} />;
}
