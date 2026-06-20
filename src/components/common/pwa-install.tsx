"use client";

import { useEffect, useState } from "react";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    // @ts-expect-error beforeinstallprompt API
    deferredPrompt.prompt();
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-24 left-1/2 z-50 w-[calc(100%-2rem)] max-w-[448px] -translate-x-1/2 rounded-2xl bg-foreground p-4 text-white shadow-xl">
      <p className="text-sm font-medium">Install Saathini</p>
      <p className="text-xs text-white/70 mt-1">Add to home screen for the best experience</p>
      <div className="mt-3 flex gap-2">
        <button onClick={() => setShow(false)} className="flex-1 rounded-lg bg-white/10 py-2 text-xs font-medium">
          Later
        </button>
        <button onClick={handleInstall} className="flex-1 rounded-lg bg-primary py-2 text-xs font-medium">
          Install
        </button>
      </div>
    </div>
  );
}
