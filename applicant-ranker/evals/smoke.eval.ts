import { defineEval } from "@grok/agent-sdk/evals";

export default defineEval({
  tags: ["smoke"],
  description: "Saves ranking criteria when the user describes a bar.",
  async test(t) {
    await t.send(
      'Save these ranking criteria for the default profile: must-haves are "3+ years TypeScript" and "shipped production React"; nice-to-haves are "GraphQL"; dealbreakers are "no portfolio or GitHub". Confirm what you saved.',
    );
    t.succeeded();
    t.calledTool("set_ranking_criteria");
  },
});
