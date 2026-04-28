import {
  createTensormesh,
  DEFAULT_TENSORMESH_SERVERLESS_BASE_URL,
  tensormesh,
} from "@tensormesh/ai-sdk-provider";

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export function getTensormeshProvider() {
  const baseURL = readEnv("TENSORMESH_BASE_URL");
  const userId = readEnv("TENSORMESH_USER_ID");

  if (!baseURL && !userId) {
    return tensormesh;
  }

  return createTensormesh({
    baseURL,
    userId,
  });
}

export function requiredEnv(name: string): string {
  const value = readEnv(name);

  if (!value) {
    throw new Error(`Missing ${name}. Add it to examples/next-starter/.env.local.`);
  }

  return value;
}

export function getChatModelId() {
  return requiredEnv("TENSORMESH_CHAT_MODEL");
}

export function getStructuredModelId() {
  return readEnv("TENSORMESH_STRUCTURED_MODEL") ?? getChatModelId();
}

export function getToolModelId() {
  return readEnv("TENSORMESH_TOOL_MODEL") ?? getChatModelId();
}

export function getExampleSummary() {
  const baseURL =
    readEnv("TENSORMESH_BASE_URL") ?? DEFAULT_TENSORMESH_SERVERLESS_BASE_URL;
  const userId = readEnv("TENSORMESH_USER_ID");
  const mode =
    readEnv("TENSORMESH_BASE_URL") || userId ? "on-demand" : "serverless";

  return {
    mode,
    baseURL,
    userIdPresent: Boolean(userId),
    chatModel: readEnv("TENSORMESH_CHAT_MODEL") ?? "(not set)",
    structuredModel:
      readEnv("TENSORMESH_STRUCTURED_MODEL") ??
      readEnv("TENSORMESH_CHAT_MODEL") ??
      "(not set)",
    toolModel:
      readEnv("TENSORMESH_TOOL_MODEL") ??
      readEnv("TENSORMESH_CHAT_MODEL") ??
      "(not set)",
  };
}
