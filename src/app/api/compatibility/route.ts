import { NextResponse } from "next/server";
import { calculateCompatibility } from "@/lib/matching/compatibility";
import type { Profile } from "@/types";

export async function POST(request: Request) {
  try {
    const { profileA, profileB } = await request.json() as { profileA: Profile; profileB: Profile };
    if (!profileA || !profileB) {
      return NextResponse.json({ error: "Missing profiles" }, { status: 400 });
    }
    const result = calculateCompatibility(profileA, profileB);
    return NextResponse.json({ data: result });
  } catch {
    return NextResponse.json({ error: "Calculation failed" }, { status: 500 });
  }
}
