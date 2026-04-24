import { generateText, Output } from "ai";
import { z } from "zod";
import { createLiveTestContext } from "./live-common.mjs";

// This is the package-level structured-output path, not a raw HTTP probe.
// It should work with either the default serverless provider or an on-demand
// provider configured through env.
const { modelId, provider, summary } = createLiveTestContext();

console.log("Tensormesh structured-output test");
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
  output: Output.object({
    schema: z.object({
      brand: z.string(),
      model: z.string(),
      // Keep this broad: the test is about structured JSON output, not
      // whether the model picks our preferred car category label.
      carType: z.string(),
    }),
  }),
  prompt:
    "Generate a JSON object with the brand, model, and carType of the most iconic car from the 90s.",
});

console.log(
  JSON.stringify(
    {
      output: result.output,
      finishReason: result.finishReason,
      usage: result.usage,
      text: result.text,
    },
    null,
    2,
  ),
);
