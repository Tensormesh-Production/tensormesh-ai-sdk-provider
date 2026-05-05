import { createLiveTestContext } from "./live-common.mjs";
import {
  getToolChoiceForModel,
  weatherCityDescription,
  weatherPrompt,
  weatherToolDescription,
  weatherToolName,
} from "./tool-calling-example.mjs";

const { modelId, provider, summary } = createLiveTestContext();
const toolChoice = getToolChoiceForModel(modelId);

const weatherTool = {
  type: "function",
  name: weatherToolName,
  description: weatherToolDescription,
  strict: true,
  parameters: {
    type: "object",
    properties: {
      city: {
        type: "string",
        description: weatherCityDescription,
      },
    },
    required: ["city"],
    additionalProperties: false,
  },
};

console.log("Tensormesh Responses API tool-calling test");
console.log(
  JSON.stringify(
    summary,
    null,
    2,
  ),
);
console.log("");

const response = await provider.responses.create({
  model: modelId,
  input: weatherPrompt,
  tools: [weatherTool],
  tool_choice: toolChoice,
});

const output = Array.isArray(response?.output) ? response.output : [];
const toolCalls = collectToolCalls(output);
const weatherCall = toolCalls.find((call) => call.name === weatherToolName);

console.log(
  JSON.stringify(
    {
      id: response?.id,
      model: response?.model,
      toolChoice,
      toolCalls,
      output,
    },
    null,
    2,
  ),
);

if (!weatherCall) {
  throw new Error(
    "Expected Responses API output to include a structured weather tool call.",
  );
}

function collectToolCalls(items) {
  const calls = [];

  for (const item of items) {
    if (!item || typeof item !== "object") {
      continue;
    }

    if (
      (item.type === "function_call" || item.type === "tool_call") &&
      typeof item.name === "string"
    ) {
      calls.push(item);
    }

    if (Array.isArray(item.tool_calls)) {
      calls.push(...item.tool_calls);
    }

    if (Array.isArray(item.content)) {
      calls.push(...collectToolCalls(item.content));
    }
  }

  return calls;
}
