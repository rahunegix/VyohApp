import { z } from "zod";

export const ProfileBuilderOutputSchema = z.object({
  short_bio: z.string().max(200),
  detailed_bio: z.string().max(600),
  personality_summary: z.string().max(300),
  personality_tags: z.array(z.string()).max(8),
  interest_tags: z.array(z.string()).max(10),
  relationship_style: z.string().max(200),
  communication_style: z.string().max(200),
  lifestyle_tags: z.array(z.string()).max(8),
  values_tags: z.array(z.string()).max(8),
});

export const CompatibilityOutputSchema = z.object({
  score: z.number().min(0).max(100),
  strengths: z.array(z.string()).max(6),
  concerns: z.array(z.string()).max(4),
  summary: z.string().max(400),
});

export const ReadinessOutputSchema = z.object({
  overall: z.number().min(0).max(100),
  communication: z.number().min(0).max(100),
  commitment: z.number().min(0).max(100),
  family_alignment: z.number().min(0).max(100),
  emotional_readiness: z.number().min(0).max(100),
  marriage_readiness: z.number().min(0).max(100),
  long_term_potential: z.number().min(0).max(100),
  summary: z.string().max(400),
});

export const ProfileCoachOutputSchema = z.object({
  completion_score: z.number().min(0).max(100),
  recommendations: z.array(
    z.object({
      type: z.enum(["photo", "bio", "values", "interests", "verification", "general"]),
      priority: z.enum(["high", "medium", "low"]),
      message: z.string(),
    })
  ).max(8),
});

export const ConversationStartersSchema = z.object({
  ice_breakers: z.array(z.string()).max(5),
  shared_interest_questions: z.array(z.string()).max(4),
  compatibility_questions: z.array(z.string()).max(4),
});

export const MatchExplanationSchema = z.object({
  match_summary: z.string().max(300),
  compatibility_highlights: z.array(z.string()).max(5),
  discussion_areas: z.array(z.string()).max(4),
  trust_note: z.string().max(200).optional(),
});

export const ModerationOutputSchema = z.object({
  risk_level: z.enum(["none", "low", "medium", "high"]),
  categories: z.array(z.string()),
  explanation: z.string().max(300),
  recommend_review: z.boolean(),
});

export const TrustScoreOutputSchema = z.object({
  score: z.number().min(0).max(100),
  level: z.enum(["new", "building", "trusted", "highly_trusted"]),
  factors: z.record(z.string(), z.number()),
  summary: z.string().max(200),
});

export const SearchQuerySchema = z.object({
  filters: z.object({
    intent: z.string().optional(),
    gender: z.string().optional(),
    district: z.string().optional(),
    region: z.string().optional(),
    profession: z.string().optional(),
    education: z.string().optional(),
    keywords: z.array(z.string()).optional(),
  }),
  interpreted_query: z.string(),
});

export const AssistantReplySchema = z.object({
  reply: z.string().max(500),
  suggested_actions: z.array(z.string()).max(3).optional(),
});

export type ProfileBuilderOutput = z.infer<typeof ProfileBuilderOutputSchema>;
export type CompatibilityOutput = z.infer<typeof CompatibilityOutputSchema>;
export type ReadinessOutput = z.infer<typeof ReadinessOutputSchema>;
export type ProfileCoachOutput = z.infer<typeof ProfileCoachOutputSchema>;
export type ConversationStartersOutput = z.infer<typeof ConversationStartersSchema>;
export type MatchExplanationOutput = z.infer<typeof MatchExplanationSchema>;
export type ModerationOutput = z.infer<typeof ModerationOutputSchema>;
export type TrustScoreOutput = z.infer<typeof TrustScoreOutputSchema>;
export type SearchQueryOutput = z.infer<typeof SearchQuerySchema>;
export type AssistantReplyOutput = z.infer<typeof AssistantReplySchema>;
