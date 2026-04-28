import {
  OpenAICompatibleChatLanguageModel,
  OpenAICompatibleCompletionLanguageModel,
} from "@ai-sdk/openai-compatible";
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
  /**
   * Creates a completion model for text generation.
   */
  completionModel(modelId: TensormeshChatModelId): LanguageModelV3;
  /**
   * Raw `/v1/models` helper.
   */
  models: TensormeshModelsApi;
  /**
   * Raw `/v1/responses` helpers.
   */
  responses: TensormeshResponsesApi;
  /**
   * Raw `/tokenize` helper.
   */
  tokenize: TensormeshTokenizeApi;
  /**
   * Raw `/detokenize` helper.
   */
  detokenize: TensormeshDetokenizeApi;
  /**
   * Raw `/health` helper.
   */
  health: TensormeshHealthApi;
  /**
   * Raw `/version` helper.
   */
  version: TensormeshVersionApi;
}

export interface TensormeshRequestOptions {
  /**
   * Request-specific headers.
   */
  headers?: Record<string, string>;
  /**
   * Abort signal for the request.
   */
  abortSignal?: AbortSignal;
}

export type TensormeshRequestBody = Record<string, unknown>;

export interface TensormeshModel {
  id: string;
  object?: string;
  owned_by?: string;
  [key: string]: unknown;
}

export interface TensormeshModelList {
  object?: string;
  data: TensormeshModel[];
  [key: string]: unknown;
}

export interface TensormeshTokenizeResponse {
  tokens: number[];
  [key: string]: unknown;
}

export interface TensormeshDetokenizeResponse {
  prompt: string;
  [key: string]: unknown;
}

export interface TensormeshHealthResponse {
  status?: string;
  [key: string]: unknown;
}

export interface TensormeshVersionResponse {
  version?: string;
  [key: string]: unknown;
}

export interface TensormeshModelsApi {
  list(options?: TensormeshRequestOptions): Promise<TensormeshModelList>;
}

export interface TensormeshResponsesApi {
  create<TResponse = unknown>(
    body: TensormeshRequestBody,
    options?: TensormeshRequestOptions,
  ): Promise<TResponse>;
  stream(
    body: TensormeshRequestBody,
    options?: TensormeshRequestOptions,
  ): Promise<Response>;
}

export interface TensormeshTokenizeApi {
  create(
    body: TensormeshRequestBody,
    options?: TensormeshRequestOptions,
  ): Promise<TensormeshTokenizeResponse>;
}

export interface TensormeshDetokenizeApi {
  create(
    body: TensormeshRequestBody,
    options?: TensormeshRequestOptions,
  ): Promise<TensormeshDetokenizeResponse>;
}

export interface TensormeshHealthApi {
  get(options?: TensormeshRequestOptions): Promise<TensormeshHealthResponse>;
}

export interface TensormeshVersionApi {
  get(options?: TensormeshRequestOptions): Promise<TensormeshVersionResponse>;
}

interface CommonModelConfig {
  provider: string;
  url: ({ path }: { path: string }) => string;
  headers: () => Record<string, string>;
  fetch?: FetchFunction;
}

interface HeaderOptions {
  requireApiKey: boolean;
}

interface RawRequestOptions extends TensormeshRequestOptions {
  method: "GET" | "POST";
  path: string;
  body?: TensormeshRequestBody;
  base: "v1" | "root";
  requireApiKey: boolean;
  acceptEventStream?: boolean;
}

export function createTensormesh(
  options: TensormeshProviderSettings = {},
): TensormeshProvider {
  const baseURL = withoutTrailingSlash(
    options.baseURL ?? DEFAULT_TENSORMESH_SERVERLESS_BASE_URL,
  ) ?? DEFAULT_TENSORMESH_SERVERLESS_BASE_URL;
  const rootURL = stripV1Path(baseURL);
  const userId = options.userId ?? loadOptionalEnv(TENSORMESH_USER_ID_ENV_NAME);

  const getHeaders = ({ requireApiKey }: HeaderOptions) => {
    const apiKey = requireApiKey
      ? loadApiKey({
          apiKey: options.apiKey,
          environmentVariableName: TENSORMESH_INFERENCE_API_KEY_ENV_NAME,
          description: "Tensormesh inference API key",
        })
      : options.apiKey ?? loadOptionalEnv(TENSORMESH_INFERENCE_API_KEY_ENV_NAME);

    return withUserAgentSuffix(
      {
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        ...(userId ? { "X-User-Id": userId } : {}),
        ...options.headers,
      },
      `ai-sdk/tensormesh/${VERSION}`,
    );
  };

  const getCommonModelConfig = (modelType: string): CommonModelConfig => ({
    provider: `tensormesh.${modelType}`,
    url: ({ path }) => `${baseURL}${path}`,
    headers: () => getHeaders({ requireApiKey: true }),
    ...(options.fetch ? { fetch: options.fetch } : {}),
  });

  const createChatModel = (modelId: TensormeshChatModelId) =>
    new OpenAICompatibleChatLanguageModel(modelId, {
      ...getCommonModelConfig("chat"),
      includeUsage: true,
      supportsStructuredOutputs: true,
    });

  const createCompletionModel = (modelId: TensormeshChatModelId) =>
    new OpenAICompatibleCompletionLanguageModel(modelId, {
      ...getCommonModelConfig("completion"),
      includeUsage: true,
    });

  const request = async ({
    method,
    path,
    body,
    base,
    requireApiKey,
    acceptEventStream,
    headers,
    abortSignal,
  }: RawRequestOptions) => {
    const fetchImpl = options.fetch ?? globalThis.fetch;
    if (typeof fetchImpl !== "function") {
      throw new Error("No fetch implementation available.");
    }

    const response = await fetchImpl(`${base === "v1" ? baseURL : rootURL}${path}`, {
      method,
      headers: {
        ...getHeaders({ requireApiKey }),
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(acceptEventStream ? { Accept: "text/event-stream" } : {}),
        ...headers,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      ...(abortSignal ? { signal: abortSignal } : {}),
    });

    return response;
  };

  const requestJson = async <TResponse>({
    acceptEventStream: _acceptEventStream,
    ...requestOptions
  }: RawRequestOptions): Promise<TResponse> => {
    const response = await request(requestOptions);
    return parseJsonResponse<TResponse>(response);
  };

  const requestStream = async ({
    body,
    ...requestOptions
  }: RawRequestOptions): Promise<Response> => {
    const response = await request({
      ...requestOptions,
      body: { ...body, stream: true },
      acceptEventStream: true,
    });

    if (!response.ok) {
      throw new Error(await formatErrorResponse(response));
    }

    return response;
  };

  const responses: TensormeshResponsesApi = {
    create: <TResponse = unknown>(
      body: TensormeshRequestBody,
      requestOptions?: TensormeshRequestOptions,
    ) =>
      requestJson<TResponse>({
        method: "POST",
        path: "/responses",
        base: "v1",
        requireApiKey: true,
        body,
        ...requestOptions,
      }),
    stream: (body: TensormeshRequestBody, requestOptions?: TensormeshRequestOptions) =>
      requestStream({
        method: "POST",
        path: "/responses",
        base: "v1",
        requireApiKey: true,
        body,
        ...requestOptions,
      }),
  };

  const provider = (modelId: TensormeshChatModelId) => createChatModel(modelId);

  provider.specificationVersion = "v3" as const;
  provider.chatModel = createChatModel;
  provider.languageModel = createChatModel;
  provider.completionModel = createCompletionModel;
  provider.models = {
    list: (requestOptions?: TensormeshRequestOptions) =>
      requestJson<TensormeshModelList>({
        method: "GET",
        path: "/models",
        base: "v1",
        requireApiKey: false,
        ...requestOptions,
      }),
  };
  provider.responses = responses;
  provider.tokenize = {
    create: (
      body: TensormeshRequestBody,
      requestOptions?: TensormeshRequestOptions,
    ) =>
      requestJson<TensormeshTokenizeResponse>({
        method: "POST",
        path: "/tokenize",
        base: "root",
        requireApiKey: true,
        body,
        ...requestOptions,
      }),
  };
  provider.detokenize = {
    create: (
      body: TensormeshRequestBody,
      requestOptions?: TensormeshRequestOptions,
    ) =>
      requestJson<TensormeshDetokenizeResponse>({
        method: "POST",
        path: "/detokenize",
        base: "root",
        requireApiKey: true,
        body,
        ...requestOptions,
      }),
  };
  provider.health = {
    get: (requestOptions?: TensormeshRequestOptions) =>
      requestJson<TensormeshHealthResponse>({
        method: "GET",
        path: "/health",
        base: "root",
        requireApiKey: false,
        ...requestOptions,
      }),
  };
  provider.version = {
    get: (requestOptions?: TensormeshRequestOptions) =>
      requestJson<TensormeshVersionResponse>({
        method: "GET",
        path: "/version",
        base: "root",
        requireApiKey: false,
        ...requestOptions,
      }),
  };

  return provider as TensormeshProvider;
}

export const tensormesh = createTensormesh();

function loadOptionalEnv(name: string): string | undefined {
  if (typeof process === "undefined") {
    return undefined;
  }

  const value = process.env[name];
  return typeof value === "string" ? value : undefined;
}

function stripV1Path(baseURL: string): string {
  return baseURL.endsWith("/v1") ? baseURL.slice(0, -3) : baseURL;
}

async function parseJsonResponse<TResponse>(response: Response): Promise<TResponse> {
  const text = await response.text();

  if (!response.ok) {
    throw new Error(formatResponseStatus(response, text));
  }

  if (!text) {
    return undefined as TResponse;
  }

  return JSON.parse(text) as TResponse;
}

async function formatErrorResponse(response: Response): Promise<string> {
  return formatResponseStatus(response, await response.text());
}

function formatResponseStatus(response: Response, text: string): string {
  return `Tensormesh request failed with ${response.status} ${response.statusText}${
    text ? `: ${text}` : ""
  }`;
}
