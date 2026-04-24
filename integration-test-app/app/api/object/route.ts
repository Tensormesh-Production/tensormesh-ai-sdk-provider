import { Output, streamText } from "ai";
import { ideaSchema } from "./schema";
import {
  getStructuredModelId,
  getTensormeshProvider,
} from "../../../lib/tensormesh";

export const maxDuration = 30;

export async function POST(req: Request) {
  const context = await req.json();
  const provider = getTensormeshProvider();

  const result = streamText({
    model: provider(getStructuredModelId()),
    prompt: `Generate one launch-ready product idea in this context: ${context}`,
    output: Output.object({
      schema: ideaSchema,
    }),
  });

  return result.toTextStreamResponse();
}
