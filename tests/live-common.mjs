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

export function createLiveProviderContext() {
  const baseURL = optionalEnv("TENSORMESH_BASE_URL");
  const userId = optionalEnv("TENSORMESH_USER_ID");
  const modelId = optionalEnv("TENSORMESH_MODEL");

  if (baseURL) {
    return {
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

export function createLiveTestContext() {
  const modelId = requiredEnv("TENSORMESH_MODEL");
  const context = createLiveProviderContext();

  return {
    ...context,
    modelId,
    summary: {
      ...context.summary,
      model: modelId,
    },
  };
}

function optionalEnv(name) {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}
