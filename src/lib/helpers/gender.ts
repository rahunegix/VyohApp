import type { Gender, LookingFor } from "@/types";

/** Male seeks female, female seeks male — no manual selection needed. */
export function deriveLookingForFromGender(gender: Gender): LookingFor {
  if (gender === "male") return "female";
  if (gender === "female") return "male";
  return "everyone";
}

export function getLookingForLabel(gender: Gender): string {
  if (gender === "male") return "Women";
  if (gender === "female") return "Men";
  return "Everyone";
}
