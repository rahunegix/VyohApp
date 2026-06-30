import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Platform } from "@/types";

interface PlatformState {
  activePlatform: Platform;
  availablePlatforms: Platform[];
  setActivePlatform: (platform: Platform) => void;
  setAvailablePlatforms: (platforms: Platform[]) => void;
}

export const usePlatformStore = create<PlatformState>()(
  persist(
    (set) => ({
      activePlatform: "dating",
      availablePlatforms: ["dating"],
      setActivePlatform: (activePlatform) => set({ activePlatform }),
      setAvailablePlatforms: (availablePlatforms) => set({ availablePlatforms }),
    }),
    { name: "saathini-platform" }
  )
);
