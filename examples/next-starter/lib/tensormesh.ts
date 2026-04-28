import {
  createTensormesh,
  DEFAULT_TENSORMESH_SERVERLESS_BASE_URL,
  tensormesh,
} from "@tensormesh/ai-sdk-provider";

export type ModelPurpose = "chat" | "structured" | "tool";

let cachedModelIds: string[] | undefined;

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

export function getDefaultModelIds() {
  const chatModel = readEnv("TENSORMESH_CHAT_MODEL") ?? "";

  return {
    chat: chatModel,
    structured: readEnv("TENSORMESH_STRUCTURED_MODEL") ?? chatModel,
    tool: readEnv("TENSORMESH_TOOL_MODEL") ?? chatModel,
  };
}

export async function getAvailableModelIds() {
  if (cachedModelIds) {
    return cachedModelIds;
  }

  const provider = getTensormeshProvider();
  const response = await provider.models.list();
  const modelIds = response.data
    .map((model) => model.id)
    .filter((id): id is string => typeof id === "string" && id.length > 0);

  cachedModelIds = [...new Set(modelIds)];
  return cachedModelIds;
}

export async function resolveModelId(
  requestedModelId: unknown,
  purpose: ModelPurpose,
) {
  const requested =
    typeof requestedModelId === "string" ? requestedModelId.trim() : "";
  const fallback = getDefaultModelIds()[purpose];
  const modelId = requested || fallback;

  if (!modelId) {
    throw new Error("Select a model before sending a request.");
  }

  const modelIds = await getAvailableModelIds();

  if (modelIds.length > 0 && !modelIds.includes(modelId)) {
    throw new Error(`Model "${modelId}" is not available on this endpoint.`);
  }

  return modelId;
}

export function getExampleSummary() {
  const baseURL =
    readEnv("TENSORMESH_BASE_URL") ?? DEFAULT_TENSORMESH_SERVERLESS_BASE_URL;
  const userId = readEnv("TENSORMESH_USER_ID");
  const mode =
    readEnv("TENSORMESH_BASE_URL") || userId ? "on-demand" : "serverless";
  const defaults = getDefaultModelIds();

  return {
    mode,
    baseURL,
    userIdPresent: Boolean(userId),
    chatModel: defaults.chat || "(not set)",
    structuredModel: defaults.structured || "(not set)",
    toolModel: defaults.tool || "(not set)",
    defaults,
  };
}
