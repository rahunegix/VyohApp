import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("subscription_plans")
    .select("*")
    .eq("active", true)
    .order("price", { ascending: true });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  const plans = (data ?? []).map((row) => {
    const name = String(row.name);
    const lower = name.toLowerCase();
    const id = lower.includes("vip")
      ? "vip"
      : lower.includes("plus")
        ? "premium_plus"
        : lower.includes("premium")
          ? "premium"
          : "free";
    const features = Array.isArray(row.features)
      ? row.features
      : typeof row.features === "string"
        ? JSON.parse(row.features)
        : [];
    return {
      id,
      name,
      price: Number(row.price),
      billing_cycle: row.billing_cycle,
      features,
      db_id: row.id,
    };
  });

  return NextResponse.json({ success: true, data: plans });
}
