import { getPublicProfileAvailability } from "@/lib/seo/service";
import { BannedProfilePage } from "@/components/seo/banned-profile-page";
import { MatchDetailsClient } from "./match-details-client";

export default async function MatchDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const availability = await getPublicProfileAvailability(id);

  if (availability.status === "banned") {
    return <BannedProfilePage profileId={id} />;
  }

  return <MatchDetailsClient profileId={id} />;
}
