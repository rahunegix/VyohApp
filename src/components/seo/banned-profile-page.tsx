import Link from "next/link";
import { ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLogo } from "@/components/common/app-logo";

export function BannedProfilePage({ profileId }: { profileId?: string }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-muted/30 px-6 py-16 text-center">
      <AppLogo className="mb-8 h-10 opacity-80" />
      <div className="mx-auto max-w-md rounded-3xl border border-border bg-white p-8 shadow-[var(--shadow-card)]">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <ShieldOff className="h-8 w-8" />
        </div>
        <p className="text-6xl font-black text-muted-foreground/30">404</p>
        <h1 className="mt-2 text-xl font-bold text-foreground">Profile unavailable</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          This profile has been removed, suspended, or is no longer public on Saathini.
          {profileId ? " The link you followed may be outdated." : ""}
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link href="/">
            <Button className="w-full rounded-xl sm:w-auto">Explore Saathini</Button>
          </Link>
          <Link href="/welcome">
            <Button variant="outline" className="w-full rounded-xl sm:w-auto">
              Join Saathini
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
