import { z } from "zod";
import { OTP_LENGTH } from "@/lib/auth/otp-config";

export const phoneSchema = z.object({
  phone: z.string().min(10, "Enter a valid phone number").max(15),
});

export const otpSchema = z.object({
  phone: z.string().min(10),
  otp: z.string().length(OTP_LENGTH, `OTP must be ${OTP_LENGTH} digits`),
});

export const genderSchema = z.object({
  gender: z.enum(["male", "female", "other"]),
});

export const lookingForSchema = z.object({
  looking_for: z.enum(["male", "female", "everyone"]),
});

export const intentSchema = z.object({
  intent: z.enum(["exploring", "serious", "marriage"]),
  reason: z.string().optional(),
});

export const basicProfileSchema = z.object({
  full_name: z.string().min(2, "Name is required"),
  dob: z.string().min(1, "Date of birth is required"),
  city: z.string().min(1, "City is required"),
  district: z.string().min(1, "District is required"),
  village: z.string().optional(),
  region: z.enum(["garhwal", "kumaon"]),
  education: z.string().min(1, "Education is required"),
  profession: z.string().min(1, "Profession is required"),
  bio: z.string().max(500).optional(),
});

export const basicInfoFormSchema = basicProfileSchema
  .omit({ education: true, profession: true })
  .extend({
    education_select: z.string().min(1, "Education is required"),
    education_custom: z.string().optional(),
    profession_select: z.string().min(1, "Profession is required"),
    profession_custom: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.education_select === "other" && !val.education_custom?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please specify your education",
        path: ["education_custom"],
      });
    }
    if (val.profession_select === "other" && !val.profession_custom?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please specify your profession",
        path: ["profession_custom"],
      });
    }
  });

export const editProfileSchema = basicProfileSchema.extend({
  gender: z.enum(["male", "female", "other"]),
  looking_for: z.enum(["male", "female", "everyone"]),
  intent: z.enum(["exploring", "serious", "marriage"]),
  lifestyle: z.record(z.string(), z.string()).optional(),
  family_background: z.record(z.string(), z.string()).optional(),
});

export const editProfileFormSchema = editProfileSchema
  .omit({ education: true, profession: true })
  .extend({
    education_select: z.string().min(1, "Education is required"),
    education_custom: z.string().optional(),
    profession_select: z.string().min(1, "Profession is required"),
    profession_custom: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.education_select === "other" && !val.education_custom?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please specify your education",
        path: ["education_custom"],
      });
    }
    if (val.profession_select === "other" && !val.profession_custom?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please specify your profession",
        path: ["profession_custom"],
      });
    }
  });

export const editIntentMatchingSchema = z.object({
  intent: z.enum(["serious", "marriage"]),
  looking_for: z.enum(["male", "female", "everyone"]),
});

export const editLifestylePayloadSchema = z.record(z.string(), z.string());

export const editFamilyPayloadSchema = z.record(z.string(), z.string());

export const editPhotosSchema = z.object({
  photos: z.array(z.string().min(1)).min(1).max(6),
});

export const editAnswersSchema = z.record(z.string(), z.string());

export const lifestyleSchema = z.object({
  smoking: z.enum(["never", "occasionally", "regularly"]).optional(),
  drinking: z.enum(["never", "occasionally", "regularly"]).optional(),
  food_preference: z.enum(["veg", "non_veg", "eggetarian", "vegan"]).optional(),
  kids_preference: z.enum(["want", "dont_want", "open", "have"]).optional(),
  relocation: z.enum(["willing", "not_willing", "open"]).optional(),
  languages: z.array(z.string()).optional(),
});

export const familyBackgroundSchema = z.object({
  family_type: z.string().optional(),
  religious_preference: z.string().optional(),
  religious_other: z.string().optional(),
  community_preference: z.string().optional(),
  community: z.enum(["brahmin", "rajput", "other"]).optional(),
  community_other: z.string().optional(),
  marital_status: z.enum(["never_married", "divorced", "widowed", "separated"]).optional(),
  profile_created_by: z.enum(["self", "parents", "siblings", "guardians", "friend"]).optional(),
  brothers_count: z.string().optional(),
  brothers_married: z.string().optional(),
  sisters_count: z.string().optional(),
  sisters_married: z.string().optional(),
  father_status: z.enum(["not_alive", "working", "retired"]).optional(),
  father_field: z.string().optional(),
  father_field_other: z.string().optional(),
  father_retired_field: z.string().optional(),
  father_retired_field_other: z.string().optional(),
  mother_status: z.enum(["not_alive", "working", "homemaker"]).optional(),
  mother_field: z.string().optional(),
  mother_field_other: z.string().optional(),
  gotra: z.string().optional(),
  seriousness_timeline: z.string().optional(),
});

export const chatRequestSchema = z.object({
  receiver_profile_id: z.string().uuid(),
  message: z.string().min(1).max(300),
});

export const messageSchema = z.object({
  conversation_id: z.string().uuid(),
  message_text: z.string().min(1).max(2000),
  message_type: z.enum(["text", "image", "voice"]).default("text"),
});

export const reportSchema = z.object({
  reported_profile_id: z.string().uuid(),
  reason: z.string().min(1),
  details: z.string().max(1000).optional(),
});

export const blockSchema = z.object({
  blocked_profile_id: z.string().uuid(),
});

export const privacySettingsSchema = z.object({
  show_photos: z.boolean(),
  show_city: z.boolean(),
  show_district: z.boolean(),
  show_contact: z.boolean(),
  allow_family_access: z.boolean(),
  allow_search_indexing: z.boolean(),
});

export const aiAnswerSchema = z.object({
  question_key: z.string(),
  answer_value: z.string().min(1),
});
