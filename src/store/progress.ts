import { create } from "zustand";

interface ProgressState {
  visible: boolean;
  title: string;
  show: (title?: string) => void;
  hide: () => void;
}

export const useProgressStore = create<ProgressState>((set) => ({
  visible: false,
  title: "Please wait…",
  show: (title = "Please wait…") => set({ visible: true, title }),
  hide: () => set({ visible: false }),
}));
