import { Output, streamText } from "ai";
import { ideaSchema } from "./schema";
import { getTensormeshProvider, resolveModelId } from "../../../lib/tensormesh";

export const maxDuration = 30;

export async function POST(req: Request) {
  const body = await req.json();
  const context = typeof body === "string" ? body : body?.context;
  const contextText =
    typeof context === "string" && context.trim()
      ? context
      : "Create a launch idea for a GPU inference startup.";
  const selectedModelId = await resolveModelId(body?.modelId, "structured");
  const provider = getTensormeshProvider();

  const result = streamText({
    model: provider(selectedModelId),
    prompt: `Generate one launch-ready product idea in this context: ${contextText}`,
    output: Output.object({
      schema: ideaSchema,
    }),
  });

  return result.toTextStreamResponse();
}
