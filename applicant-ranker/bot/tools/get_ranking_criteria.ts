import { prompt } from "@grok/agent-sdk";
import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import {
  DEFAULT_PROFILE,
  criteriaKey,
  criteriaSchema,
} from "../lib/criteria.js";

export default defineTool({
  description: prompt`
    Load a saved ranking criteria profile. Call before ranking when
    criteria may already be stored, or when the user asks what the
    current bar is.
  `,
  execution: "server",
  effect: "read",
  inputSchema: z.object({
    profileName: z
      .string()
      .min(1)
      .default(DEFAULT_PROFILE)
      .describe("Criteria profile to load. Defaults to default."),
  }),
  async execute({ profileName }, ctx) {
    const name = profileName ?? DEFAULT_PROFILE;
    const raw = await ctx.host.kv.get(criteriaKey(name));
    if (raw === undefined) {
      return {
        found: false,
        profileName: name,
        message:
          "No criteria saved for this profile. Ask the user to describe must-haves, nice-to-haves, and dealbreakers, then call set_ranking_criteria.",
      };
    }
    const parsed = criteriaSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        found: false,
        profileName: name,
        message: "Saved criteria were malformed. Ask the user to set them again.",
      };
    }
    return { found: true, criteria: parsed.data };
  },
});
