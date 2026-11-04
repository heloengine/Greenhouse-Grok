import { prompt } from "@grok/agent-sdk";
import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import {
  DEFAULT_PROFILE,
  LATEST_RANKING_KEY,
  criteriaKey,
  criteriaSchema,
  rankingEntrySchema,
  type RankingResult,
} from "../lib/criteria.js";

export default defineTool({
  description: prompt`
    Record a completed ranking of applicants against the active
    criteria. Score and order applicants yourself first, then call
    this tool with the ordered list so the result is stored and
    returned in a stable shape. Does not invent scores — pass the
    judgments you already made.
  `,
  execution: "server",
  effect: "idempotent",
  inputSchema: z.object({
    profileName: z.string().min(1).default(DEFAULT_PROFILE),
    rankings: z
      .array(rankingEntrySchema)
      .min(1)
      .describe("Applicants ordered best-first. rank must be 1..N with no gaps."),
    summary: z
      .string()
      .optional()
      .describe("Short overall note for the hiring manager."),
  }),
  dryRunResult: ({ profileName, rankings }) => ({
    recorded: false,
    dryRun: true,
    profileName: profileName ?? DEFAULT_PROFILE,
    count: rankings.length,
  }),
  async execute({ profileName, rankings, summary }, ctx) {
    const name = profileName ?? DEFAULT_PROFILE;

    const ranks = rankings.map((r) => r.rank).sort((a, b) => a - b);
    const expected = rankings.map((_, i) => i + 1);
    if (ranks.join(",") !== expected.join(",")) {
      return {
        recorded: false,
        error:
          "rank values must be unique integers 1..N with no gaps (best applicant is rank 1).",
      };
    }

    const ordered = [...rankings].sort((a, b) => a.rank - b.rank);

    const rawCriteria = await ctx.host.kv.get(criteriaKey(name));
    const criteriaParsed = criteriaSchema.safeParse(rawCriteria);
    const criteriaSnapshot = criteriaParsed.success ? criteriaParsed.data : undefined;

    const result: RankingResult = {
      profileName: name,
      criteriaSnapshot,
      rankings: ordered,
      summary,
      rankedAt: new Date().toISOString(),
    };

    await ctx.host.kv.put(LATEST_RANKING_KEY, result);
    await ctx.host.kv.put(`ranking-result:${ctx.session.id}`, result);

    return {
      recorded: true,
      profileName: name,
      count: ordered.length,
      topApplicantId: ordered[0]?.applicantId,
      topName: ordered[0]?.name,
      advanceCount: ordered.filter((r) => r.recommendation === "advance").length,
      maybeCount: ordered.filter((r) => r.recommendation === "maybe").length,
      rejectCount: ordered.filter((r) => r.recommendation === "reject").length,
      rankedAt: result.rankedAt,
      rankings: ordered,
      criteriaFound: criteriaSnapshot !== undefined,
    };
  },
});
