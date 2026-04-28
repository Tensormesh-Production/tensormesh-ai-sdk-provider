import {
  consumeStream,
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai";
import { getTensormeshProvider, resolveModelId } from "../../../lib/tensormesh";

export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    messages,
    modelId,
  }: {
    messages: UIMessage[];
    modelId?: unknown;
  } = await req.json();
  const provider = getTensormeshProvider();
  const selectedModelId = await resolveModelId(modelId, "chat");

  const result = streamText({
    model: provider(selectedModelId),
    messages: await convertToModelMessages(messages),
    abortSignal: req.signal,
  });

  return result.toUIMessageStreamResponse({
    consumeSseStream: consumeStream,
  });
}
