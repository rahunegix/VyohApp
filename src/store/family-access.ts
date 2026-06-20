import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FamilyAccessLevel = "view" | "manage";

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  phone: string;
  verified: boolean;
  accessLevel: FamilyAccessLevel;
}

interface FamilyAccessState {
  enabled: boolean;
  allowViewProfile: boolean;
  allowRespondInterests: boolean;
  allowEditProfile: boolean;
  members: FamilyMember[];
  setEnabled: (enabled: boolean) => void;
  setAllowViewProfile: (value: boolean) => void;
  setAllowRespondInterests: (value: boolean) => void;
  setAllowEditProfile: (value: boolean) => void;
  addMember: (member: Omit<FamilyMember, "id">) => void;
  removeMember: (id: string) => void;
}

export const useFamilyAccessStore = create<FamilyAccessState>()(
  persist(
    (set) => ({
      enabled: true,
      allowViewProfile: true,
      allowRespondInterests: false,
      allowEditProfile: false,
      members: [
        {
          id: "demo-father",
          name: "Rajesh Rawat",
          relation: "father",
          phone: "9876543210",
          verified: true,
          accessLevel: "view",
        },
      ],
      setEnabled: (enabled) => set({ enabled }),
      setAllowViewProfile: (allowViewProfile) => set({ allowViewProfile }),
      setAllowRespondInterests: (allowRespondInterests) => set({ allowRespondInterests }),
      setAllowEditProfile: (allowEditProfile) => set({ allowEditProfile }),
      addMember: (member) =>
        set((s) => ({
          members: [...s.members, { ...member, id: `fm-${Date.now()}` }],
        })),
      removeMember: (id) =>
        set((s) => ({ members: s.members.filter((m) => m.id !== id) })),
    }),
    { name: "saathini-family-access" }
  )
);
