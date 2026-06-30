import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProfileBuilderOutput } from "@/lib/ai/schemas";
import type { OnboardingState, Profile, User, Notification } from "@/types";
import { deriveLookingForFromGender } from "@/lib/helpers/gender";
import {
  DEMO_INTEREST_RECEIVED,
  DEMO_INTEREST_SENT,
} from "@/services/demo-interests";
import {
  DEFAULT_DISCOVER_FILTERS,
  type DiscoverFilters,
} from "@/lib/constants/discover-filters";

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("saathini-onboarding");
        }
        set({ user: null, profile: null, isAuthenticated: false });
      },
    }),
    { name: "saathini-auth", partialize: (s) => ({ user: s.user, profile: s.profile, isAuthenticated: s.isAuthenticated }) }
  )
);

interface OnboardingStore extends OnboardingState {
  setStep: (step: number) => void;
  setPlatform: (platform: OnboardingState["platform"]) => void;
  setVipInviteCode: (code: string | null) => void;
  setVipDetails: (details: Partial<OnboardingState["vipDetails"]>) => void;
  setGender: (gender: OnboardingState["gender"]) => void;
  setLookingFor: (looking_for: OnboardingState["looking_for"]) => void;
  setIntent: (intent: OnboardingState["intent"]) => void;
  setAiAnswer: (key: string, value: string) => void;
  addPhoto: (url: string) => void;
  removePhoto: (url: string) => void;
  setPhotos: (photos: string[]) => void;
  setBasicInfo: (info: Partial<Profile>) => void;
  setLifestyle: (key: string, value: string) => void;
  setFamilyBackground: (key: string, value: string) => void;
  setAiGeneratedProfile: (profile: ProfileBuilderOutput | null) => void;
  reset: () => void;
}

const initialOnboarding: OnboardingState = {
  step: 0,
  platform: null,
  vipInviteCode: null,
  vipDetails: {},
  gender: null,
  looking_for: null,
  intent: null,
  aiAnswers: {},
  photos: [],
  basicInfo: {},
  lifestyle: {},
  familyBackground: {},
  aiGeneratedProfile: null,
};

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      ...initialOnboarding,
      setStep: (step) => set({ step }),
      setPlatform: (platform) => set({ platform }),
      setVipInviteCode: (vipInviteCode) => set({ vipInviteCode }),
      setVipDetails: (details) =>
        set((s) => ({ vipDetails: { ...s.vipDetails, ...details } })),
      setGender: (gender) =>
        set({
          gender,
          looking_for: gender ? deriveLookingForFromGender(gender) : null,
        }),
      setLookingFor: (looking_for) => set({ looking_for }),
      setIntent: (intent) => set({ intent }),
      setAiAnswer: (key, value) =>
        set((s) => ({ aiAnswers: { ...s.aiAnswers, [key]: value } })),
      addPhoto: (url) => set((s) => ({ photos: [...s.photos, url] })),
      removePhoto: (url) => set((s) => ({ photos: s.photos.filter((p) => p !== url) })),
      setPhotos: (photos) => set({ photos }),
      setBasicInfo: (info) => set((s) => ({ basicInfo: { ...s.basicInfo, ...info } })),
      setLifestyle: (key, value) =>
        set((s) => ({ lifestyle: { ...s.lifestyle, [key]: value } })),
      setFamilyBackground: (key, value) =>
        set((s) => ({ familyBackground: { ...s.familyBackground, [key]: value } })),
      setAiGeneratedProfile: (aiGeneratedProfile) => set({ aiGeneratedProfile }),
      reset: () => set(initialOnboarding),
    }),
    { name: "saathini-onboarding" }
  )
);

interface AppState {
  unreadChats: number;
  unreadNotifications: number;
  notifications: Notification[];
  setUnreadChats: (count: number) => void;
  setUnreadNotifications: (count: number) => void;
  setNotifications: (notifications: Notification[]) => void;
  markNotificationRead: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  unreadChats: 0,
  unreadNotifications: 0,
  notifications: [],
  setUnreadChats: (unreadChats) => set({ unreadChats }),
  setUnreadNotifications: (unreadNotifications) => set({ unreadNotifications }),
  setNotifications: (notifications) => set({ notifications }),
  markNotificationRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      ),
      unreadNotifications: Math.max(0, s.unreadNotifications - 1),
    })),
}));

export interface ShortlistEntry {
  profileId: string;
  at: string;
}

interface ShortlistState {
  entries: ShortlistEntry[];
  add: (profileId: string) => void;
  remove: (profileId: string) => void;
  toggle: (profileId: string) => void;
  has: (profileId: string) => boolean;
}

export const useShortlistStore = create<ShortlistState>()(
  persist(
    (set, get) => ({
      entries: [],
      add: (profileId) =>
        set((s) => {
          if (s.entries.some((e) => e.profileId === profileId)) return s;
          return {
            entries: [{ profileId, at: new Date().toISOString() }, ...s.entries],
          };
        }),
      remove: (profileId) =>
        set((s) => ({
          entries: s.entries.filter((e) => e.profileId !== profileId),
        })),
      toggle: (profileId) => {
        if (get().has(profileId)) get().remove(profileId);
        else get().add(profileId);
      },
      has: (profileId) => get().entries.some((e) => e.profileId === profileId),
    }),
    { name: "saathini-shortlist" }
  )
);

export interface StoredInterestEntry {
  profileId: string;
  at: string;
  mutual?: boolean;
}

function toStoredInterest(
  entries: { profile: { id: string }; at: string; mutual?: boolean }[]
): StoredInterestEntry[] {
  return entries.map(({ profile, at, mutual }) => ({
    profileId: profile.id,
    at,
    mutual,
  }));
}

interface InterestState {
  received: StoredInterestEntry[];
  sent: StoredInterestEntry[];
  acceptReceived: (profileId: string) => void;
  declineReceived: (profileId: string) => void;
  unsendSent: (profileId: string) => void;
  addSent: (profileId: string) => void;
}

export const useInterestStore = create<InterestState>()(
  persist(
    (set) => ({
      received: toStoredInterest(DEMO_INTEREST_RECEIVED),
      sent: toStoredInterest(DEMO_INTEREST_SENT),
      acceptReceived: (profileId) =>
        set((s) => ({
          received: s.received.filter((e) => e.profileId !== profileId),
        })),
      declineReceived: (profileId) =>
        set((s) => ({
          received: s.received.filter((e) => e.profileId !== profileId),
        })),
      unsendSent: (profileId) =>
        set((s) => ({
          sent: s.sent.filter((e) => e.profileId !== profileId),
        })),
      addSent: (profileId) =>
        set((s) => {
          if (s.sent.some((e) => e.profileId === profileId)) return s;
          return {
            sent: [{ profileId, at: new Date().toISOString() }, ...s.sent],
          };
        }),
    }),
    { name: "saathini-interests" }
  )
);

interface DiscoverFiltersState {
  applied: DiscoverFilters;
  setApplied: (filters: DiscoverFilters) => void;
  resetApplied: () => void;
}

export const useDiscoverFiltersStore = create<DiscoverFiltersState>()(
  persist(
    (set) => ({
      applied: DEFAULT_DISCOVER_FILTERS,
      setApplied: (applied) => set({ applied }),
      resetApplied: () => set({ applied: DEFAULT_DISCOVER_FILTERS }),
    }),
    { name: "saathini-discover-filters" }
  )
);

export { useUIStore } from "./ui";
export { useProgressStore } from "./progress";
