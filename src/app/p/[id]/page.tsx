import type { Metadata } from "next";
import { getPublicProfileAvailability } from "@/lib/seo/service";
import { buildProfileMetadata } from "@/lib/seo/metadata";
import { BannedProfilePage } from "@/components/seo/banned-profile-page";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPin, Shield } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const result = await getPublicProfileAvailability(id);

  if (result.status === "available") {
    return buildProfileMetadata({ ...result, id });
  }

  return {
    title: "Profile Unavailable | Saathini",
    description: "This Saathini profile is no longer available.",
    robots: { index: false, follow: false },
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getPublicProfileAvailability(id);

  if (result.status === "available") {
    const location = [result.city, result.district, result.region].filter(Boolean).join(", ");

    return (
      <div className="min-h-dvh bg-muted/20 px-5 py-10">
        <div className="mx-auto max-w-lg rounded-3xl border border-border bg-white p-8 shadow-[var(--shadow-card)] text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[6px] bg-primary/10 text-2xl font-bold text-primary">
            {result.full_name.charAt(0)}
          </div>
          <h1 className="text-2xl font-bold text-foreground">{result.full_name}</h1>
          {location && (
            <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {location}
            </p>
          )}
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-[6px] bg-success/10 px-3 py-1 text-xs font-semibold text-success">
            <Shield className="h-3.5 w-3.5" />
            Verified Saathini member
          </div>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            Sign in to Saathini to view full profile details, photos, compatibility, and connect securely.
          </p>
          <Link href="/" className="mt-6 block">
            <Button size="lg" className="w-full rounded-2xl">
              Join Saathini to Connect
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <BannedProfilePage profileId={id} />;
}
