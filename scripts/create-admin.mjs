/**
 * Create the first admin user with email + password.
 *
 * Usage:
 *   node scripts/create-admin.mjs admin@saathini.com YourSecurePassword123
 *
 * Requires in .env.local (or env):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const email = process.argv[2]?.trim().toLowerCase();
const password = process.argv[3];

if (!email || !password) {
  console.error("Usage: node scripts/create-admin.mjs <email> <password>");
  process.exit(1);
}

if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const passwordHash = await bcrypt.hash(password, 10);

const { data: existing } = await supabase
  .from("users")
  .select("id, role")
  .eq("email", email)
  .maybeSingle();

if (existing) {
  const { error } = await supabase
    .from("users")
    .update({
      role: "admin",
      password_hash: passwordHash,
      is_active: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", existing.id);

  if (error) {
    console.error("Update failed:", error.message);
    process.exit(1);
  }

  console.log(`Updated existing user ${email} as admin.`);
  process.exit(0);
}

const { data: created, error: insertError } = await supabase
  .from("users")
  .insert({
    email,
    role: "admin",
    password_hash: passwordHash,
    is_active: true,
  })
  .select("id")
  .single();

if (insertError) {
  console.error("Insert failed:", insertError.message);
  console.error("Run migration 008_admin_password.sql if password_hash column is missing.");
  process.exit(1);
}

console.log(`Admin created: ${email} (id: ${created.id})`);
console.log("Login at: /admin/login");
