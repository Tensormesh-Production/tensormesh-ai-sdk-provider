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

## Model Capabilities

- The same package supports both serverless and on-demand on the `chat/completions` path. On-demand only adds `baseURL` and `userId`.
- Text generation and streaming are validated on the currently tested serverless and on-demand models.
- Structured outputs are enabled in the provider and currently work on most tested models. `MiniMaxAI/MiniMax-M2.5` is intermittent on the current serving path.
- Tool calling is currently verified with `mistralai/Devstral-2-123B-Instruct-2512`. Tested Qwen variants need serving-side tool parser support, `MiniMaxAI/MiniMax-M2.5` is not cleanly parsed on the current tool path, and GPT OSS tool use belongs to `/v1/responses` rather than this package's `chat/completions` path.
- The examples in this README use `mistralai/Devstral-2-123B-Instruct-2512` because it is a clean validated baseline on the current Tensormesh `chat/completions` path.
- Serving-side updates may expand or change model-specific capability without any package change.

## Documentation

Please check out the package source and Tensormesh docs for more information.
