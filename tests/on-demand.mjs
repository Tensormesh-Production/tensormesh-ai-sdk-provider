import { generateText, streamText } from "ai";
import { createTensormesh } from "@tensormesh/ai-sdk-provider";

// On-demand uses the same package API with a routed base URL plus user id.
const baseURL = requiredEnv("TENSORMESH_BASE_URL");
const modelId = requiredEnv("TENSORMESH_MODEL");
const userId = requiredEnv("TENSORMESH_USER_ID");

const tm = createTensormesh({
  baseURL,
  userId,
});

console.log("Tensormesh on-demand test");
console.log(
  JSON.stringify(
    {
      baseURL,
      model: modelId,
      userIdPresent: true,
      apiKeyPresent: Boolean(process.env.TENSORMESH_INFERENCE_API_KEY),
    },
    null,
    2,
  ),
);
console.log("");

const textResult = await generateText({
  model: tm(modelId),
  prompt: "In one sentence, say hello from Tensormesh on-demand.",
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
  model: tm(modelId),
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
