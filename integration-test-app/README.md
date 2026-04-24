# Tensormesh Integration Test App

This is a small Next.js integration app for validating `@tensormesh/ai-sdk-provider`
in a real Vercel AI SDK application.

It follows the same general pattern as the AI SDK reference apps:

- `useChat` + App Router API route for streaming chat
- `experimental_useObject` + App Router API route for structured output
- `useChat` + App Router API route for tool calling

## What It Covers

- Streaming chat with `streamText()`
- Structured output with `streamText()` + `Output.object(...)`
- Server-side tool calling with `streamText()` + `tool(...)`
- Both serverless and on-demand, using the same package API

## Setup

1. Copy `.env.local.example` to `.env.local`
2. Fill in `TENSORMESH_INFERENCE_API_KEY`
3. Optional: set `TENSORMESH_BASE_URL` and `TENSORMESH_USER_ID` for on-demand
4. Install dependencies:

```sh
npm install
```

5. Run the app:

```sh
npm run dev
```

Then open `http://localhost:3000`.

## Notes

- The default models in `.env.local.example` use Devstral because it is the cleanest current baseline on the package `chat/completions` path.
- Qwen tool calling and MiniMax tool calling are still deployment-dependent and are not good defaults for the tool route.
- GPT OSS remains useful for chat on this package path, but its tool-use path is `/v1/responses`, not this app.
