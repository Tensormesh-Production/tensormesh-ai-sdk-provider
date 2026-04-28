import {
  consumeStream,
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai";
import { getChatModelId, getTensormeshProvider } from "../../../lib/tensormesh";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const provider = getTensormeshProvider();

  const result = streamText({
    model: provider(getChatModelId()),
    messages: await convertToModelMessages(messages),
    abortSignal: req.signal,
  });

  return result.toUIMessageStreamResponse({
    consumeSseStream: consumeStream,
  });
}
