import {
  convertToModelMessages,
  InferUITools,
  stepCountIs,
  streamText,
  tool,
  UIDataTypes,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { getTensormeshProvider, resolveModelId } from "../../../lib/tensormesh";

export const maxDuration = 30;

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

const tools = {
  weather: weatherTool,
} as const;

export type UseChatToolsMessage = UIMessage<
  never,
  UIDataTypes,
  InferUITools<typeof tools>
>;

export async function POST(req: Request) {
  const {
    messages,
    modelId,
  }: {
    messages: UseChatToolsMessage[];
    modelId?: unknown;
  } = await req.json();
  const provider = getTensormeshProvider();
  const selectedModelId = await resolveModelId(modelId, "tool");
  const toolChoice = getToolChoiceForModel(selectedModelId);

  const result = streamText({
    model: provider(selectedModelId),
    messages: await convertToModelMessages(messages),
    tools,
    // GPT OSS models only accept auto; other models use required to force the call.
    prepareStep: async ({ stepNumber }) => {
      if (stepNumber === 0) {
        return { toolChoice };
      }

      return {};
    },
    stopWhen: stepCountIs(3),
    abortSignal: req.signal,
  });

  return result.toUIMessageStreamResponse();
}

function getToolChoiceForModel(modelId: string) {
  return modelId.toLowerCase().includes("gpt-oss") ? "auto" : "required";
}
