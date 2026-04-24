import { generateText, stepCountIs, tool } from "ai";
import { z } from "zod";
import { createLiveTestContext } from "./live-common.mjs";

// This test uses the package exactly as an app would, with either the default
// serverless provider or a custom on-demand provider from env.
const { modelId, provider, summary } = createLiveTestContext();

const weatherTool = tool({
  description: "Return the weather for a city.",
  inputSchema: z.object({
    city: z.string().describe("City name to look up"),
  }),
  execute: async ({ city }) => ({
    city,
    condition: "sunny",
    temperatureC: 32,
  }),
});

console.log("Tensormesh tool-calling test");
console.log(
  JSON.stringify(
    summary,
    null,
    2,
  ),
);
console.log("");

const result = await generateText({
  model: provider(modelId),
  prompt:
    "What is the weather in Bangkok? Use the weather tool, then answer in one sentence.",
  tools: {
    weather: weatherTool,
  },
  // Force the first step to exercise tool calling before the model answers.
  prepareStep: async ({ stepNumber }) => {
    if (stepNumber === 0) {
      return { toolChoice: "required" };
    }

    return {};
  },
  stopWhen: stepCountIs(3),
});

console.log(result.text);
console.log(
  JSON.stringify(
    {
      stepCount: result.steps.length,
      finishReason: result.finishReason,
      usage: result.usage,
      totalUsage: result.totalUsage,
      steps: result.steps.map((step, index) => ({
        step: index,
        text: step.text,
        finishReason: step.finishReason,
        toolCalls: step.toolCalls,
        toolResults: step.toolResults,
        usage: step.usage,
      })),
    },
    null,
    2,
  ),
);
