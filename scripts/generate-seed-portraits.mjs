/**
 * Generate AI seed portrait PNGs into public/seed-faces/
 *
 * Usage:
 *   node scripts/generate-seed-portraits.mjs
 *   node scripts/generate-seed-portraits.mjs --only male-01,female-01
 *   node scripts/generate-seed-portraits.mjs --limit 4
 *
 * Requires OPENAI_API_KEY in .env.local (loaded via dotenv if present)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnvLocal() {
  const envPath = join(root, ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()]) {
      process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  }
}

loadEnvLocal();

const REGION_HINT = {
  garhwal: "Garhwali features, hills of Garhwal Uttarakhand",
  kumaon: "Kumaoni features, hills of Kumaon Uttarakhand",
};

function buildPrompt(spec) {
  const genderLabel = spec.gender === "male" ? "man" : "woman";
  const vibe = spec.vibe ?? "warm and approachable";
  return [
    `Ultra-realistic casual portrait photo of an Indian ${genderLabel}, age ${spec.age}, from ${REGION_HINT[spec.region]}.`,
    `${vibe}, natural skin texture and pores, minimal makeup, authentic not airbrushed.`,
    "Soft natural daylight, smartphone camera quality, slight depth of field.",
    "Modern modest Indian outfit, neutral blurred outdoor background (Himalayan foothills).",
    "Looking at camera, relaxed slight smile, dating-app profile photo style.",
    "Photorealistic, single person, head and shoulders, no text, no watermark, no logo.",
  ].join(" ");
}

async function generateOne(spec) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not set in .env.local");

  const model = process.env.OPENAI_IMAGE_MODEL ?? "dall-e-3";
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      prompt: buildPrompt(spec),
      n: 1,
      size: "1024x1024",
      quality: "standard",
      response_format: "b64_json",
    }),
  });

  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
  const json = await res.json();
  const b64 = json.data?.[0]?.b64_json;
  if (!b64) throw new Error("No image in response");
  return { b64, revisedPrompt: json.data?.[0]?.revised_prompt };
}

function parseArgs() {
  const onlyArg = process.argv.find((a) => a.startsWith("--only="));
  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  return {
    only: onlyArg ? onlyArg.split("=")[1].split(",") : null,
    limit: limitArg ? Number(limitArg.split("=")[1]) : null,
  };
}

async function main() {
  const specsPath = join(root, "src/data/seed-portrait-specs.json");
  let specs = JSON.parse(readFileSync(specsPath, "utf8"));
  const { only, limit } = parseArgs();

  if (only) specs = specs.filter((s) => only.includes(s.id));
  if (limit) specs = specs.slice(0, limit);

  const outDir = join(root, "public/seed-faces");
  mkdirSync(outDir, { recursive: true });

  const manifest = existsSync(join(outDir, "manifest.json"))
    ? JSON.parse(readFileSync(join(outDir, "manifest.json"), "utf8"))
    : { generatedAt: null, faces: [] };

  const faceMap = new Map(manifest.faces.map((f) => [f.id, f]));

  for (const spec of specs) {
    const fileName = `${spec.id}.png`;
    const filePath = join(outDir, fileName);

    if (existsSync(filePath)) {
      console.log(`skip ${spec.id} (exists)`);
      continue;
    }

    console.log(`generating ${spec.id}...`);
    try {
      const { b64, revisedPrompt } = await generateOne(spec);
      writeFileSync(filePath, Buffer.from(b64, "base64"));
      faceMap.set(spec.id, {
        id: spec.id,
        gender: spec.gender,
        age: spec.age,
        region: spec.region,
        path: `/seed-faces/${fileName}`,
        aiGenerated: true,
        revisedPrompt,
      });
      console.log(`saved ${fileName}`);
      await new Promise((r) => setTimeout(r, 1500));
    } catch (e) {
      console.error(`failed ${spec.id}:`, e.message);
    }
  }

  manifest.generatedAt = new Date().toISOString();
  manifest.faces = [...faceMap.values()];
  writeFileSync(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log("done — manifest updated");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
