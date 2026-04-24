import {
  DEFAULT_TENSORMESH_SERVERLESS_BASE_URL,
  createTensormesh,
  tensormesh,
} from "@tensormesh/ai-sdk-provider";

// Use one shared model id so the output is easy to scan.
const modelId = "mistralai/Devstral-2-123B-Instruct-2512";

// This shows the only extra step needed for a non-default endpoint.
const customProvider = createTensormesh({
  baseURL: "https://example.tensormesh.ai/v1",
});

console.log("Tensormesh package import test");

console.log(
  JSON.stringify(
    {
      serverlessBaseURL: DEFAULT_TENSORMESH_SERVERLESS_BASE_URL,
      defaultProviderModel: {
        provider: tensormesh(modelId).provider,
        modelId: tensormesh(modelId).modelId,
      },
      customProviderModel: {
        provider: customProvider(modelId).provider,
        modelId: customProvider(modelId).modelId,
      },
    },
    null,
    2,
  ),
);
