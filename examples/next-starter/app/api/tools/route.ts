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
import { getTensormeshProvider, getToolModelId } from "../../../lib/tensormesh";

export const maxDuration = 30;

const weatherTool = tool({
  description: "Return the weather for a city.",
  inputSchema: z.object({
    city: z.string(),
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
  const { messages }: { messages: UseChatToolsMessage[] } = await req.json();
  const provider = getTensormeshProvider();

  const result = streamText({
    model: provider(getToolModelId()),
    messages: await convertToModelMessages(messages),
    tools,
    prepareStep: async ({ stepNumber }) => {
      if (stepNumber === 0) {
        return { toolChoice: "required" };
      }

      return {};
    },
    stopWhen: stepCountIs(3),
    abortSignal: req.signal,
  });

  return result.toUIMessageStreamResponse();
}
