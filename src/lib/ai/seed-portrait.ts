/**
 * AI portrait generation for admin seed profiles.
 * Uses OpenAI Images API — synthetic faces only, never real-person likeness.
 */

export type SeedPortraitGender = "male" | "female";

export interface SeedPortraitSpec {
  id: string;
  gender: SeedPortraitGender;
  age: number;
  region: "garhwal" | "kumaon";
  vibe?: string;
}

const REGION_HINT: Record<SeedPortraitSpec["region"], string> = {
  garhwal: "Garhwali features, hills of Garhwal Uttarakhand",
  kumaon: "Kumaoni features, hills of Kumaon Uttarakhand",
};

export function buildSeedPortraitPrompt(spec: SeedPortraitSpec): string {
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

export interface GeneratedPortrait {
  id: string;
  b64: string;
  revisedPrompt?: string;
}

export async function generateSeedPortrait(
  spec: SeedPortraitSpec
): Promise<GeneratedPortrait> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

  const model = process.env.OPENAI_IMAGE_MODEL ?? "dall-e-3";
  const prompt = buildSeedPortraitPrompt(spec);

  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      response_format: "b64_json",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI Images API error: ${res.status} ${err}`);
  }

  const json = await res.json();
  const item = json.data?.[0];
  if (!item?.b64_json) throw new Error("No image returned from OpenAI");

  return {
    id: spec.id,
    b64: item.b64_json,
    revisedPrompt: item.revised_prompt,
  };
}
