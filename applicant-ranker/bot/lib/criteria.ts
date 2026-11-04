import * as z from "zod/v4";

export const CRITERIA_KEY_PREFIX = "ranking-criteria:";
export const DEFAULT_PROFILE = "default";
export const LATEST_RANKING_KEY = "ranking-result:latest";

export const criteriaSchema = z.object({
  profileName: z.string().min(1).default(DEFAULT_PROFILE),
  role: z.string().optional().describe("Job or role title these criteria apply to."),
  mustHaves: z
    .array(z.string().min(1))
    .min(1)
    .describe("Hard requirements. Missing any should block advancement."),
  niceToHaves: z
    .array(z.string().min(1))
    .default([])
    .describe("Preferred signals that raise the score when present."),
  dealbreakers: z
    .array(z.string().min(1))
    .default([])
    .describe("Immediate reject conditions."),
  weights: z
    .record(z.string(), z.number().min(0).max(100))
    .optional()
    .describe("Optional criterion → weight (0–100). Weights need not sum to 100."),
  notes: z.string().optional().describe("Free-form scoring guidance from the user."),
  updatedAt: z.string().optional(),
});

export type RankingCriteria = z.infer<typeof criteriaSchema>;

export const rankingEntrySchema = z.object({
  rank: z.number().int().positive(),
  applicantId: z.string().min(1),
  name: z.string().min(1),
  score: z.number().min(0).max(100),
  strengths: z.array(z.string()).default([]),
  gaps: z.array(z.string()).default([]),
  recommendation: z.enum(["advance", "maybe", "reject"]),
  rationale: z.string().min(1),
});

export const rankingResultSchema = z.object({
  profileName: z.string().min(1).default(DEFAULT_PROFILE),
  criteriaSnapshot: criteriaSchema.optional(),
  rankings: z.array(rankingEntrySchema).min(1),
  summary: z.string().optional(),
  rankedAt: z.string().optional(),
});

export type RankingResult = z.infer<typeof rankingResultSchema>;

export function criteriaKey(profileName: string): string {
  return `${CRITERIA_KEY_PREFIX}${profileName}`;
}
