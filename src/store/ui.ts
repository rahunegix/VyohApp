"use client";

import { create } from "zustand";

interface UIState {
  saathiBriefDismissed: boolean;
  saathiSheetOpen: boolean;
  dismissSaathiBrief: () => void;
  setSaathiSheetOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  saathiBriefDismissed: false,
  saathiSheetOpen: false,
  dismissSaathiBrief: () => set({ saathiBriefDismissed: true }),
  setSaathiSheetOpen: (saathiSheetOpen) => set({ saathiSheetOpen }),
}));
