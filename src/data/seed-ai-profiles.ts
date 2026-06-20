import type { DiscoverProfile, Gender } from "@/types";
import manifest from "@/data/seed-faces-manifest.json";

type FaceEntry = (typeof manifest.faces)[number];

const UTTARAKHAND_PROFILES = {
  male: [
    { name: "Vikram Singh", city: "Nainital", district: "Nainital", region: "kumaon" as const, profession: "Software Engineer", intent: "marriage" as const, age: 30 },
    { name: "Arjun Rawat", city: "Dehradun", district: "Dehradun", region: "garhwal" as const, profession: "Civil Engineer", intent: "serious" as const, age: 28 },
    { name: "Karan Bisht", city: "Haldwani", district: "Nainital", region: "kumaon" as const, profession: "Teacher", intent: "marriage" as const, age: 29 },
    { name: "Rohit Negi", city: "Rishikesh", district: "Dehradun", region: "garhwal" as const, profession: "Hotel Manager", intent: "serious" as const, age: 27 },
  ],
  female: [
    { name: "Priya Bisht", city: "Haridwar", district: "Haridwar", region: "garhwal" as const, profession: "Graphic Designer", intent: "exploring" as const, age: 25 },
    { name: "Neha Rawat", city: "Almora", district: "Almora", region: "kumaon" as const, profession: "Nurse", intent: "serious" as const, age: 26 },
    { name: "Kavya Joshi", city: "Pithoragarh", district: "Pithoragarh", region: "kumaon" as const, profession: "Pharmacist", intent: "marriage" as const, age: 24 },
    { name: "Meera Chand", city: "Mussoorie", district: "Dehradun", region: "garhwal" as const, profession: "Content Writer", intent: "exploring" as const, age: 23 },
  ],
};

function faceToProfile(face: FaceEntry, index: number): DiscoverProfile {
  const pool = face.gender === "male" ? UTTARAKHAND_PROFILES.male : UTTARAKHAND_PROFILES.female;
  const meta = pool[index % pool.length];
  const id = `seed-${face.id}`;

  return {
    id,
    user_id: `seed-user-${face.id}`,
    full_name: meta.name,
    gender: face.gender as Gender,
    looking_for: face.gender === "male" ? "female" : "male",
    dob: `${new Date().getFullYear() - meta.age}-06-15`,
    age: meta.age,
    city: meta.city,
    district: meta.district,
    village: null,
    region: meta.region,
    education: "Graduate",
    profession: meta.profession,
    bio: `${meta.name.split(" ")[0]} is from ${meta.district}, Uttarakhand — rooted in Pahadi values, open to meaningful connection.`,
    ai_bio: null,
    intent: meta.intent,
    profile_status: "active",
    trust_score: 72 + (index % 20),
    compatibility_score: 0,
    readiness_score: 70,
    personality_tags: ["grounded", "family oriented"],
    interest_tags: ["trekking", "music", "local food"],
    values_tags: ["respect", "honesty"],
    lifestyle: { smoking: "never", drinking: "never", food_preference: "veg" },
    family_background: { family_type: "nuclear", religious_preference: "hindu" },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    photos: [
      {
        id: `photo-${id}`,
        profile_id: id,
        url: face.path,
        sort_order: 0,
        is_private: false,
        is_primary: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    verification: {
      id: `v-${id}`,
      profile_id: id,
      mobile_verified: true,
      face_verified: true,
      id_verified: false,
      family_verified: false,
      verified_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    distance_label: `${8 + index * 5} km away`,
  };
}

/** AI-generated seed profiles (synthetic faces from /public/seed-faces) */
export const SEED_AI_PROFILES: DiscoverProfile[] = manifest.faces.map(faceToProfile);

export function getSeedFaceUrl(faceId: string): string | undefined {
  return manifest.faces.find((f) => f.id === faceId)?.path;
}
