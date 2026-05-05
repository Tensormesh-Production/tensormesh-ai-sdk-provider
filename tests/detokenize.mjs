import { createLiveTestContext } from "./live-common.mjs";

const { modelId, provider, summary } = createLiveTestContext();

console.log("Tensormesh detokenize endpoint test");
console.log(JSON.stringify(summary, null, 2));
console.log("");

const tokens = await getTokens();
const response = await provider.detokenize.create({
  model: modelId,
  tokens,
});

console.log(
  JSON.stringify(
    {
      prompt: response.prompt,
    },
    null,
    2,
  ),
);

if (typeof response.prompt !== "string") {
  throw new Error("Expected detokenize.prompt to be a string.");
}

async function getTokens() {
  const tokensEnv = process.env.TENSORMESH_DETOKENIZE_TOKENS?.trim();

  if (tokensEnv) {
    const tokens = tokensEnv
      .split(",")
      .map((token) => Number.parseInt(token.trim(), 10));

    if (tokens.some((token) => Number.isNaN(token))) {
      throw new Error(
        "TENSORMESH_DETOKENIZE_TOKENS must be comma-separated integers.",
      );
    }

    return tokens;
  }

  const setupResponse = await provider.tokenize.create({
    model: modelId,
    prompt: "Hello from Tensormesh.",
  });

  return setupResponse.tokens;
}
