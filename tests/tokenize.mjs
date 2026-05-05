import { createLiveTestContext } from "./live-common.mjs";

const { modelId, provider, summary } = createLiveTestContext();

console.log("Tensormesh tokenize endpoint test");
console.log(JSON.stringify(summary, null, 2));
console.log("");

const response = await provider.tokenize.create({
  model: modelId,
  prompt: "Hello from Tensormesh.",
});

console.log(
  JSON.stringify(
    {
      tokenCount: Array.isArray(response.tokens) ? response.tokens.length : 0,
      tokens: response.tokens,
    },
    null,
    2,
  ),
);

if (!Array.isArray(response.tokens) || response.tokens.length === 0) {
  throw new Error("Expected tokenize.tokens to be a non-empty array.");
}
