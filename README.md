# Tensormesh AI SDK Provider

The **Tensormesh provider** for the [Vercel AI SDK](https://ai-sdk.dev/docs) contains language model support for Tensormesh serverless and on-demand deployments.

## Setup

Install the package:

```sh
npm install ai @tensormesh/ai-sdk-provider
```

The provider reads its default API key from `TENSORMESH_INFERENCE_API_KEY`.

For example, in local development you might put this in `.env.local`:

```sh
TENSORMESH_INFERENCE_API_KEY="YOUR_INFERENCE_API_KEY"
```

## Provider Instance

You can import the default provider instance `tensormesh` from `@tensormesh/ai-sdk-provider`:

```ts
import { tensormesh } from "@tensormesh/ai-sdk-provider";
```

If you need a customized setup, you can import `createTensormesh` from `@tensormesh/ai-sdk-provider` and create a provider instance with your settings:

```ts
import { createTensormesh } from "@tensormesh/ai-sdk-provider";

const tm = createTensormesh({
  apiKey: "YOUR_INFERENCE_API_KEY",
});
```

You can use the following optional settings to customize the Tensormesh provider instance:

- `baseURL: string`

Use a different URL prefix for API calls. The default prefix is `https://serverless.tensormesh.ai/v1`. For on-demand, set this to your routed deployment URL.

- `apiKey: string`

API key that is sent using the `Authorization` header. It defaults to the `TENSORMESH_INFERENCE_API_KEY` environment variable.

- `userId: string`

User id that is sent using the `X-User-Id` header. This is only needed for on-demand deployments. It defaults to the `TENSORMESH_USER_ID` environment variable.

- `headers: Record<string, string>`

Custom headers to include in the requests.

- `fetch: FetchFunction`

Custom fetch implementation. Defaults to the global `fetch` function. You can use it as a middleware to intercept requests, or to provide a custom fetch implementation for testing.

## Language Models

You can create Tensormesh language models using a provider instance. The first argument is the model id.

### Serverless Example

```ts
import { generateText } from "ai";
import { tensormesh } from "@tensormesh/ai-sdk-provider";

const { text } = await generateText({
  model: tensormesh("mistralai/Devstral-2-123B-Instruct-2512"),
  prompt: "Explain Tensormesh in one sentence.",
});

console.log(text);
```

### Streaming Example

```ts
import { streamText } from "ai";
import { tensormesh } from "@tensormesh/ai-sdk-provider";

const result = streamText({
  model: tensormesh("mistralai/Devstral-2-123B-Instruct-2512"),
  prompt: "Count from 1 to 5 as a short comma-separated list.",
});

for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}
process.stdout.write("\n");
```

### Completion Model Example

```ts
import { generateText } from "ai";
import { tensormesh } from "@tensormesh/ai-sdk-provider";

const { text } = await generateText({
  model: tensormesh.completionModel("openai/gpt-oss-20b"),
  prompt: "Complete this sentence: Tensormesh is",
});

console.log(text);
```

### On-Demand Example

```ts
import { generateText } from "ai";
import { createTensormesh } from "@tensormesh/ai-sdk-provider";

const tm = createTensormesh({
  baseURL: "https://YOUR_ON_DEMAND_BASE_URL/v1",
  userId: "YOUR_TENSORMESH_USER_ID",
});

const { text } = await generateText({
  model: tm("mistralai/Devstral-2-123B-Instruct-2512"),
  prompt: "Explain Tensormesh on-demand in one sentence.",
});

console.log(text);
```

## Model IDs

For serverless, use the exact model ids returned by the models endpoint:

```sh
curl https://serverless.tensormesh.ai/v1/models \
  -H "Authorization: Bearer $TENSORMESH_INFERENCE_API_KEY"
```

For on-demand, use the served gateway model name exposed by your deployment.
In addition to the serverless model set, Tensormesh can serve compatible
Hugging Face models when they are supported by the underlying serving stack,
including vLLM and LMCache. The public on-demand compatibility list is not
published yet, so use your deployment configuration as the source of truth for
now.

## Raw Inference Helpers

The provider also exposes small raw helpers for the current Tensormesh inference routes that do not map directly to the Vercel AI SDK provider abstraction:

```ts
import { tensormesh } from "@tensormesh/ai-sdk-provider";

const models = await tensormesh.models.list();

const response = await tensormesh.responses.create({
  model: "openai/gpt-oss-20b",
  input: "Say hello.",
});

const tokens = await tensormesh.tokenize.create({
  model: "openai/gpt-oss-20b",
  prompt: "Hello!",
});

const prompt = await tensormesh.detokenize.create({
  model: "openai/gpt-oss-20b",
  tokens: tokens.tokens,
});

const health = await tensormesh.health.get();
const version = await tensormesh.version.get();
```

Available helpers:

- `models.list()` calls `GET /v1/models`
- `responses.create(...)` and `responses.stream(...)` call `POST /v1/responses`
- `tokenize.create(...)` calls `POST /tokenize`
- `detokenize.create(...)` calls `POST /detokenize`
- `health.get()` calls `GET /health`
- `version.get()` calls `GET /version`

## Model Capabilities

- The same package supports both serverless and on-demand inference. On-demand only adds `baseURL` and `userId`.
- Text generation and streaming are validated on the currently tested serverless and on-demand models.
- Structured outputs are enabled in the provider and currently work on most tested models except `MiniMaxAI/MiniMax-M2.5`.
- AI SDK tool calling through `/v1/chat/completions` is currently verified with `mistralai/Devstral-2-123B-Instruct-2512`. Tested GPT OSS models and `MiniMaxAI/MiniMax-M2.5` do not error on this path, but they currently do not emit structured tool calls.
- Raw Responses API tool calling through `/v1/responses` is currently verified with `mistralai/Devstral-2-123B-Instruct-2512`, GPT OSS models, and `MiniMaxAI/MiniMax-M2.5`. Function tools should include a boolean `strict` field.
- Tested Qwen variants currently emit tool-call-shaped text instead of structured tool calls, so they need serving-side parser support.
- Embeddings, images, audio, and Control Plane APIs are intentionally not part of this package.
- The examples in this README use `mistralai/Devstral-2-123B-Instruct-2512` because it is a clean validated baseline on the current Tensormesh `chat/completions` path.
- Serving-side updates may expand or change model-specific capability without any package change.

## Example App

See `examples/next-starter` for a small Next.js starter that uses chat, structured output, tool calling, and model selection with this provider.

## Documentation

Please check out the package source and Tensormesh docs for more information.
