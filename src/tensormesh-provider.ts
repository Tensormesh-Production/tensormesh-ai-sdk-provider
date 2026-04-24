import { OpenAICompatibleChatLanguageModel } from "@ai-sdk/openai-compatible";
import { type LanguageModelV3, type ProviderV3 } from "@ai-sdk/provider";
import {
  type FetchFunction,
  loadApiKey,
  withoutTrailingSlash,
  withUserAgentSuffix,
} from "@ai-sdk/provider-utils";
import type { TensormeshChatModelId } from "./tensormesh-chat-settings.js";
import { VERSION } from "./version.js";

export const DEFAULT_TENSORMESH_SERVERLESS_BASE_URL =
  "https://serverless.tensormesh.ai/v1";
export const TENSORMESH_INFERENCE_API_KEY_ENV_NAME =
  "TENSORMESH_INFERENCE_API_KEY";
export const TENSORMESH_USER_ID_ENV_NAME = "TENSORMESH_USER_ID";

export interface TensormeshProviderSettings {
  /**
   * Tensormesh inference API key. Default value is taken from the
   * `TENSORMESH_INFERENCE_API_KEY` environment variable.
   */
  apiKey?: string;
  /**
   * Base URL for the API calls.
   *
   * Serverless defaults to `https://serverless.tensormesh.ai/v1`.
   * For on-demand, set this to your routed deployment base URL.
   */
  baseURL?: string;
  /**
   * User id forwarded as `X-User-Id`.
   *
   * This is only needed for on-demand deployments. The default value is taken
   * from the `TENSORMESH_USER_ID` environment variable.
   */
  userId?: string;
  /**
   * Custom headers to include in the requests.
   */
  headers?: Record<string, string>;
  /**
   * Custom fetch implementation. You can use it as a middleware to intercept
   * requests, or to provide a custom fetch implementation for e.g. testing.
   */
  fetch?: FetchFunction;
}

export interface TensormeshProvider
  extends Omit<ProviderV3, "embeddingModel" | "imageModel"> {
  /**
   * Creates a model for text generation.
   */
  (modelId: TensormeshChatModelId): LanguageModelV3;
  /**
   * Creates a chat model for text generation.
   */
  chatModel(modelId: TensormeshChatModelId): LanguageModelV3;
  /**
   * Creates a chat model for text generation.
   */
  languageModel(modelId: TensormeshChatModelId): LanguageModelV3;
}

interface CommonModelConfig {
  provider: string;
  url: ({ path }: { path: string }) => string;
  headers: () => Record<string, string>;
  fetch?: FetchFunction;
}

export function createTensormesh(
  options: TensormeshProviderSettings = {},
): TensormeshProvider {
  const baseURL = withoutTrailingSlash(
    options.baseURL ?? DEFAULT_TENSORMESH_SERVERLESS_BASE_URL,
  );
  const userId = options.userId ?? process.env[TENSORMESH_USER_ID_ENV_NAME];

  const getHeaders = () =>
    withUserAgentSuffix(
      {
        Authorization: `Bearer ${loadApiKey({
          apiKey: options.apiKey,
          environmentVariableName: TENSORMESH_INFERENCE_API_KEY_ENV_NAME,
          description: "Tensormesh inference API key",
        })}`,
        ...(userId ? { "X-User-Id": userId } : {}),
        ...options.headers,
      },
      `ai-sdk/tensormesh/${VERSION}`,
    );

  const getCommonModelConfig = (modelType: string): CommonModelConfig => ({
    provider: `tensormesh.${modelType}`,
    url: ({ path }) => `${baseURL}${path}`,
    headers: getHeaders,
    ...(options.fetch ? { fetch: options.fetch } : {}),
  });

  const createChatModel = (modelId: TensormeshChatModelId) =>
    new OpenAICompatibleChatLanguageModel(modelId, {
      ...getCommonModelConfig("chat"),
      includeUsage: true,
      supportsStructuredOutputs: true,
    });

  const provider = (modelId: TensormeshChatModelId) => createChatModel(modelId);

  provider.specificationVersion = "v3" as const;
  provider.chatModel = createChatModel;
  provider.languageModel = createChatModel;

  return provider as TensormeshProvider;
}

export const tensormesh = createTensormesh();
