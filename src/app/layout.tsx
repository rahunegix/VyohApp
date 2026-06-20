import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "@/styles/globals.css";
import { APP_NAME, APP_TAGLINE, LOGO_PATH } from "@/lib/constants";
import { getSiteUrl } from "@/lib/seo/config";
import { PWAInstallPrompt } from "@/components/common/pwa-install";
import { SiteFooter } from "@/components/common/site-footer";
import { AuthProvider } from "@/components/auth/auth-provider";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: APP_NAME, template: `%s | ${APP_NAME}` },
  description: APP_TAGLINE,
  manifest: "/manifest.json",
  icons: {
    icon: LOGO_PATH,
    shortcut: LOGO_PATH,
    apple: LOGO_PATH,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#C62828",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.variable} font-sans antialiased`}>
        <AuthProvider>
          <div className="app-shell flex min-h-dvh flex-col">
            <div className="flex min-h-0 flex-1 flex-col">{children}</div>
            <SiteFooter />
          </div>
          <PWAInstallPrompt />
        </AuthProvider>
      </body>
    </html>
  );
}
