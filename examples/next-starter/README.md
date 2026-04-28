# Tensormesh AI SDK Starter

A small Next.js starter for building with Tensormesh through the Vercel AI SDK.

It includes:

- Streaming chat with `useChat` and `streamText()`
- Structured output with `experimental_useObject` and `Output.object(...)`
- Server-side tool calling with `streamText()` and `tool(...)`
- Runtime model selection backed by the Tensormesh models endpoint
- Serverless by default, with optional on-demand settings

## Deploy To Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FTensormesh-Production%2Ftensormesh-ai-sdk-provider&project-name=tensormesh-ai-sdk-starter&repository-name=tensormesh-ai-sdk-starter&root-directory=examples%2Fnext-starter&env=TENSORMESH_INFERENCE_API_KEY,TENSORMESH_CHAT_MODEL,TENSORMESH_STRUCTURED_MODEL,TENSORMESH_TOOL_MODEL&envDescription=TensorMesh%20API%20key%20and%20model%20names%20for%20the%20starter&envLink=https%3A%2F%2Fgithub.com%2FTensormesh-Production%2Ftensormesh-ai-sdk-provider%2Ftree%2Fmain%2Fexamples%2Fnext-starter%23environment-variables)

The deploy button assumes this repository is public and uses `examples/next-starter`
as the Vercel root directory. Until `@tensormesh/ai-sdk-provider` is published,
this starter intentionally depends on the local package with `file:../..`.

## Local Setup

Copy the example environment file:

```sh
cp .env.local.example .env.local
```

Fill in `TENSORMESH_INFERENCE_API_KEY`, then install dependencies:

```sh
npm install
```

Run the starter:

```sh
npm run dev
```

Then open `http://localhost:3000`.

## Environment Variables

Required:

- `TENSORMESH_INFERENCE_API_KEY`
- `TENSORMESH_CHAT_MODEL` as the default selected model

Optional:

- `TENSORMESH_STRUCTURED_MODEL`
- `TENSORMESH_TOOL_MODEL`
- `TENSORMESH_BASE_URL`
- `TENSORMESH_USER_ID`

The default models in `.env.local.example` use Devstral because it is the
cleanest current baseline on the package `chat/completions` path.
The app also loads available models from `GET /v1/models` and lets you switch
models from each demo page.

For on-demand deployments, use the served gateway model name exposed by your
deployment. Tensormesh can also serve compatible Hugging Face models when they
are supported by the underlying serving stack, including vLLM and LMCache. The
public on-demand compatibility list is not published yet, so use your deployment
configuration as the source of truth for now.

## Package Dependency

This workspace version uses:

```json
"@tensormesh/ai-sdk-provider": "file:../.."
```

After the npm package is published, replace that with the published version
range before using this as a standalone template.

## Capability Notes

- Text generation and streaming are validated on the currently tested
  serverless and on-demand models.
- Structured output is model-dependent. `MiniMaxAI/MiniMax-M2.5` is intermittent
  on the current serving path.
- Tool calling is currently verified with
  `mistralai/Devstral-2-123B-Instruct-2512`.
- GPT OSS tool use belongs to `/v1/responses`, not this starter's
  `chat/completions` path.
