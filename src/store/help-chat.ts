import { create } from "zustand";

export interface HelpChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

interface HelpChatState {
  isOpen: boolean;
  messages: HelpChatMessage[];
  questionCount: number;
  open: () => void;
  close: () => void;
  toggle: () => void;
  addMessage: (message: HelpChatMessage) => void;
  incrementQuestions: () => void;
  resetSession: () => void;
}

export const useHelpChatStore = create<HelpChatState>((set) => ({
  isOpen: false,
  messages: [],
  questionCount: 0,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
  incrementQuestions: () => set((s) => ({ questionCount: s.questionCount + 1 })),
  resetSession: () => set({ messages: [], questionCount: 0 }),
}));
