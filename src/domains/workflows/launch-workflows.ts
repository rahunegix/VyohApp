import { onEvent } from "@/domains/events";
import { SAATHI_COPY } from "@/config/ai";

/** Part 9: rule-based launch workflows (no LLM) */

export function registerLaunchWorkflows(): void {
  onEvent("OTPVerified", async (event) => {
    // Draft profile created by auth route — log for analytics
    if (process.env.NODE_ENV === "development") {
      console.info("[workflow] OTPVerified", event.userId);
    }
  });

  onEvent("ProfileCompleted", async (event) => {
    const platform = event.payload.platform as string | undefined;
    if (platform === "matrimony" || platform === "vip") {
      // Face verification nudge handled in UI via Saathi copy
      if (process.env.NODE_ENV === "development") {
        console.info("[workflow] ProfileCompleted — suggest verification", SAATHI_COPY.onboarding.photoNudge);
      }
    }
  });

  onEvent("MatchCreated", async (event) => {
    if (process.env.NODE_ENV === "development") {
      console.info("[workflow] MatchCreated — prefetch starters", event.payload);
    }
  });
}

// Auto-register on import in server context
let registered = false;
export function ensureWorkflowsRegistered(): void {
  if (registered) return;
  registered = true;
  registerLaunchWorkflows();
}
