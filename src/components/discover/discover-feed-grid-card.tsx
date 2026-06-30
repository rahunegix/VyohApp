"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/helpers/utils";
import { getIntentLabel } from "@/lib/helpers/formatters";
import { useTranslation } from "@/hooks/use-translation";
import type { DiscoverProfile } from "@/types";

export function DiscoverFeedGridCard({
  profile,
  mutual,
  footer,
}: {
  profile: DiscoverProfile;
  mutual?: boolean;
  footer: ReactNode;
}) {
  const { t } = useTranslation();
  const primaryPhoto = profile.photos?.find((p) => p.is_primary) ?? profile.photos?.[0];

  return (
    <div className="flex flex-col overflow-hidden rounded-[6px] bg-card shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-elevated)] group">
      <Link href={`/matches/${profile.id}`} className="block relative">
        <div className="relative aspect-[4/5] w-full bg-muted overflow-hidden">
          {primaryPhoto ? (
            <Image
              src={primaryPhoto.url}
              alt={profile.full_name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="220px"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-primary/10 text-3xl font-semibold text-primary">
              {getInitials(profile.full_name)}
            </div>
          )}
          
          {/* Enhanced Gradient for better readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {mutual && (
            <Badge className="absolute left-3 top-3 border-0 bg-primary/90 backdrop-blur-md shadow-sm text-[10px] text-white font-medium px-2 py-0.5">
              {t("mutual_match")}
            </Badge>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
            <div className="flex items-center gap-1.5 mb-1">
              <h3 className="truncate text-base font-bold text-shadow-sm">
                {profile.full_name.split(' ')[0]}, {profile.age}
              </h3>
              {profile.verification?.face_verified && (
                <Shield className="h-4 w-4 shrink-0 text-primary drop-shadow-sm" fill="currentColor" />
              )}
            </div>
            
            <p className="flex items-center gap-1 truncate text-xs text-white/90 drop-shadow-sm mb-2.5">
              <MapPin className="h-3 w-3 shrink-0" />
              {profile.district}
            </p>
            
            <div className="flex flex-wrap gap-1.5">
              <Badge className="max-w-full truncate border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] text-white backdrop-blur-md">
                {getIntentLabel(profile.intent)}
              </Badge>
              {profile.compatibility && (
                <Badge className="border-0 bg-primary px-2 py-0.5 text-[10px] text-white shadow-sm">
                  {profile.compatibility.score}%
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Link>
      
      {/* Footer / Actions Section */}
      <div className="bg-white p-3 z-20">
        {footer}
      </div>
    </div>
  );
}
