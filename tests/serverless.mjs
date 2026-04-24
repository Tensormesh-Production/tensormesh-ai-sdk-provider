import { generateText, streamText } from "ai";
import { tensormesh } from "@tensormesh/ai-sdk-provider";

// These live scripts intentionally mirror normal package usage.
const modelId = requiredEnv("TENSORMESH_MODEL");

console.log("Tensormesh serverless test");
console.log(
  JSON.stringify(
    {
      model: modelId,
      apiKeyPresent: Boolean(process.env.TENSORMESH_INFERENCE_API_KEY),
    },
    null,
    2,
  ),
);
console.log("");

const textResult = await generateText({
  model: tensormesh(modelId),
  prompt: "In one sentence, say hello from Tensormesh serverless.",
});

console.log("generateText()");
console.log(textResult.text);
console.log(
  JSON.stringify(
    {
      finishReason: textResult.finishReason,
      usage: textResult.usage,
    },
    null,
    2,
  ),
);
console.log("");

const streamResult = streamText({
  model: tensormesh(modelId),
  prompt: "Count from 1 to 5 as a short comma-separated list.",
});

let streamedText = "";

console.log("streamText()");
for await (const chunk of streamResult.textStream) {
  process.stdout.write(chunk);
  streamedText += chunk;
}
process.stdout.write("\n");

console.log(
  JSON.stringify(
    {
      text: streamedText,
      finishReason: await streamResult.finishReason,
      usage: await streamResult.usage,
    },
    null,
    2,
  ),
);

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name}. Export it before running this script.`);
  }

  return value;
}
