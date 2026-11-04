import { prompt } from "@grok/agent-sdk";
import { defineTool } from "@grok/agent-sdk/tools";
import {
  DEFAULT_PROFILE,
  criteriaKey,
  criteriaSchema,
  type RankingCriteria,
} from "../lib/criteria.js";

export default defineTool({
  description: prompt`
    Save or replace the ranking criteria profile the agent will use
    for later applicant ranking. Call this when the user describes
    must-haves, nice-to-haves, dealbreakers, weights, or scoring notes.
  `,
  execution: "server",
  effect: "write",
  inputSchema: criteriaSchema.omit({ updatedAt: true }),
  dryRunResult: (input) => ({
    saved: false,
    dryRun: true,
    profileName: input.profileName ?? DEFAULT_PROFILE,
  }),
  async execute(input, ctx) {
    const profileName = input.profileName ?? DEFAULT_PROFILE;
    const record: RankingCriteria = {
      ...input,
      profileName,
      updatedAt: new Date().toISOString(),
    };
    await ctx.host.kv.put(criteriaKey(profileName), record);
    return {
      saved: true,
      profileName,
      mustHaveCount: record.mustHaves.length,
      niceToHaveCount: record.niceToHaves.length,
      dealbreakerCount: record.dealbreakers.length,
      updatedAt: record.updatedAt,
    };
  },
});
