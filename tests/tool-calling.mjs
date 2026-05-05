import { generateText, stepCountIs, tool } from "ai";
import { z } from "zod";
import { createLiveTestContext } from "./live-common.mjs";
import {
  createWeatherToolResult,
  getToolChoiceForModel,
  weatherCityDescription,
  weatherPrompt,
  weatherToolDescription,
  weatherToolName,
} from "./tool-calling-example.mjs";

// This test uses the package exactly as an app would, with either the default
// serverless provider or a custom on-demand provider from env.
const { modelId, provider, summary } = createLiveTestContext();
const toolChoice = getToolChoiceForModel(modelId);

const weatherTool = tool({
  description: weatherToolDescription,
  inputSchema: z.object({
    city: z.string().describe(weatherCityDescription),
  }),
  execute: createWeatherToolResult,
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
  prompt: weatherPrompt,
  tools: {
    [weatherToolName]: weatherTool,
  },
  // GPT OSS models only accept auto; other models use required to force the call.
  prepareStep: async ({ stepNumber }) => {
    if (stepNumber === 0) {
      return { toolChoice };
    }

    return {};
  },
  stopWhen: stepCountIs(3),
});

const toolCalls = result.steps.flatMap((step) => step.toolCalls ?? []);
const weatherCall = toolCalls.find(
  (call) => call.toolName === weatherToolName || call.name === weatherToolName,
);

console.log(result.text);
console.log(
  JSON.stringify(
    {
      stepCount: result.steps.length,
      toolChoice,
      toolCalls,
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

if (!weatherCall) {
  throw new Error(
    "Expected chat completions output to include a structured weather tool call.",
  );
}
