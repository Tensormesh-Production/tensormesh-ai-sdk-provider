import { createLiveTestContext } from "./live-common.mjs";

const { modelId, provider, summary } = createLiveTestContext();

console.log("Tensormesh raw endpoint test");
console.log(JSON.stringify(summary, null, 2));
console.log("");

const models = await provider.models.list();
assert(Array.isArray(models.data), "Expected models.data to be an array.");

const tokenize = await provider.tokenize.create({
  model: modelId,
  prompt: "Hello from Tensormesh.",
});
assert(
  Array.isArray(tokenize.tokens) && tokenize.tokens.length > 0,
  "Expected tokenize.tokens to be a non-empty array.",
);

const detokenize = await provider.detokenize.create({
  model: modelId,
  tokens: tokenize.tokens,
});
assert(
  typeof detokenize.prompt === "string",
  "Expected detokenize.prompt to be a string.",
);

const health = await provider.health.get();
const version = await provider.version.get();

console.log(
  JSON.stringify(
    {
      modelCount: models.data.length,
      tokenize,
      detokenize,
      health,
      version,
    },
    null,
    2,
  ),
);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
