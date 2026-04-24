import {
  DEFAULT_TENSORMESH_SERVERLESS_BASE_URL,
  createTensormesh,
  tensormesh,
} from "@tensormesh/ai-sdk-provider";

export function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name}. Export it before running this script.`);
  }

  return value;
}

export function createLiveTestContext() {
  const modelId = requiredEnv("TENSORMESH_MODEL");
  const baseURL = optionalEnv("TENSORMESH_BASE_URL");
  const userId = optionalEnv("TENSORMESH_USER_ID");

  if (baseURL) {
    return {
      modelId,
      provider: createTensormesh({
        baseURL,
        ...(userId ? { userId } : {}),
      }),
      summary: {
        mode: "on-demand",
        baseURL,
        model: modelId,
        userIdPresent: Boolean(userId),
        apiKeyPresent: Boolean(process.env.TENSORMESH_INFERENCE_API_KEY),
      },
    };
  }

  return {
    modelId,
    provider: tensormesh,
    summary: {
      mode: "serverless",
      baseURL: DEFAULT_TENSORMESH_SERVERLESS_BASE_URL,
      model: modelId,
      userIdPresent: Boolean(userId),
      apiKeyPresent: Boolean(process.env.TENSORMESH_INFERENCE_API_KEY),
    },
  };
}

function optionalEnv(name) {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}
