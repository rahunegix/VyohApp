import { notFound } from "next/navigation";
import { PlatformProvider } from "@/components/platform/platform-provider";
import { isPlatform } from "@/lib/platform";

export default async function PlatformLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ platform: string }>;
}) {
  const { platform } = await params;
  if (!isPlatform(platform)) notFound();

  return <PlatformProvider platform={platform}>{children}</PlatformProvider>;
}
