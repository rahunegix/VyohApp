import { redirect } from "next/navigation";

/** Removed from flow — looking_for is derived from gender automatically. */
export default function LookingForPage() {
  redirect("/onboarding/gender");
}
