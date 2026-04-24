import test from "node:test";
import assert from "node:assert/strict";

import { generateText, streamText } from "ai";

import {
  DEFAULT_TENSORMESH_SERVERLESS_BASE_URL,
  TENSORMESH_INFERENCE_API_KEY_ENV_NAME,
  TENSORMESH_USER_ID_ENV_NAME,
  createTensormesh,
} from "../dist/index.js";

test("serverless provider uses the default Tensormesh base URL and auth header", async () => {
  process.env[TENSORMESH_INFERENCE_API_KEY_ENV_NAME] = "tm-test-key";

  let capturedRequest;
  const provider = createTensormesh({
    fetch: async (input, init) => {
      capturedRequest = {
        url: String(input),
        method: init?.method,
        headers: Object.fromEntries(new Headers(init?.headers).entries()),
        body: JSON.parse(String(init?.body)),
      };

      return Response.json({
        id: "chatcmpl-test",
        model: "mistralai/Devstral-2-123B-Instruct-2512",
        choices: [
          {
            message: {
              role: "assistant",
              content: "Hello from Tensormesh.",
            },
            finish_reason: "stop",
          },
        ],
        usage: {
          prompt_tokens: 4,
          completion_tokens: 4,
          total_tokens: 8,
        },
      });
    },
  });

  const result = await generateText({
    model: provider("mistralai/Devstral-2-123B-Instruct-2512"),
    prompt: "Say hello.",
  });

  assert.equal(result.text, "Hello from Tensormesh.");
  assert.equal(
    provider("mistralai/Devstral-2-123B-Instruct-2512").provider,
    "tensormesh.chat",
  );
  assert.equal(
    capturedRequest.url,
    `${DEFAULT_TENSORMESH_SERVERLESS_BASE_URL}/chat/completions`,
  );
  assert.equal(capturedRequest.method, "POST");
  assert.equal(capturedRequest.headers.authorization, "Bearer tm-test-key");
  assert.equal(
    capturedRequest.body.model,
    "mistralai/Devstral-2-123B-Instruct-2512",
  );
});

test("custom baseURL and headers are forwarded", async () => {
  let capturedRequest;
  const provider = createTensormesh({
    baseURL: "https://example.tensormesh.ai/v1/",
    apiKey: "tm-custom-key",
    headers: {
      "X-Custom-Header": "custom-value",
    },
    fetch: async (input, init) => {
      capturedRequest = {
        url: String(input),
        headers: Object.fromEntries(new Headers(init?.headers).entries()),
      };

      return Response.json({
        id: "chatcmpl-test",
        model: "mistralai/Devstral-2-123B-Instruct-2512",
        choices: [
          {
            message: {
              role: "assistant",
              content: "Hello from a custom Tensormesh endpoint.",
            },
            finish_reason: "stop",
          },
        ],
        usage: {
          prompt_tokens: 5,
          completion_tokens: 7,
          total_tokens: 12,
        },
      });
    },
  });

  const result = await generateText({
    model: provider("mistralai/Devstral-2-123B-Instruct-2512"),
    prompt: "Say hello.",
  });

  assert.equal(result.text, "Hello from a custom Tensormesh endpoint.");
  assert.equal(
    provider("mistralai/Devstral-2-123B-Instruct-2512").provider,
    "tensormesh.chat",
  );
  assert.equal(
    capturedRequest.url,
    "https://example.tensormesh.ai/v1/chat/completions",
  );
  assert.equal(capturedRequest.headers.authorization, "Bearer tm-custom-key");
  assert.equal(capturedRequest.headers["x-custom-header"], "custom-value");
});

test("on-demand userId is forwarded as X-User-Id", async () => {
  let capturedRequest;
  const provider = createTensormesh({
    baseURL: "https://on-demand.tensormesh.ai/v1",
    apiKey: "tm-on-demand-key",
    userId: "user-123",
    fetch: async (input, init) => {
      capturedRequest = {
        url: String(input),
        headers: Object.fromEntries(new Headers(init?.headers).entries()),
      };

      return Response.json({
        id: "chatcmpl-test",
        model: "mistralai/Devstral-2-123B-Instruct-2512",
        choices: [
          {
            message: {
              role: "assistant",
              content: "Hello from an on-demand Tensormesh endpoint.",
            },
            finish_reason: "stop",
          },
        ],
        usage: {
          prompt_tokens: 5,
          completion_tokens: 8,
          total_tokens: 13,
        },
      });
    },
  });

  const result = await generateText({
    model: provider("mistralai/Devstral-2-123B-Instruct-2512"),
    prompt: "Say hello.",
  });

  assert.equal(result.text, "Hello from an on-demand Tensormesh endpoint.");
  assert.equal(
    capturedRequest.url,
    "https://on-demand.tensormesh.ai/v1/chat/completions",
  );
  assert.equal(capturedRequest.headers.authorization, "Bearer tm-on-demand-key");
  assert.equal(capturedRequest.headers["x-user-id"], "user-123");
});

test("userId can be loaded from environment", async () => {
  process.env[TENSORMESH_USER_ID_ENV_NAME] = "user-from-env";

  let capturedRequest;
  const provider = createTensormesh({
    apiKey: "tm-env-key",
    fetch: async (input, init) => {
      capturedRequest = {
        url: String(input),
        headers: Object.fromEntries(new Headers(init?.headers).entries()),
      };

      return Response.json({
        id: "chatcmpl-test",
        model: "mistralai/Devstral-2-123B-Instruct-2512",
        choices: [
          {
            message: {
              role: "assistant",
              content: "Hello from env user id.",
            },
            finish_reason: "stop",
          },
        ],
        usage: {
          prompt_tokens: 5,
          completion_tokens: 5,
          total_tokens: 10,
        },
      });
    },
  });

  const result = await generateText({
    model: provider("mistralai/Devstral-2-123B-Instruct-2512"),
    prompt: "Say hello.",
  });

  assert.equal(result.text, "Hello from env user id.");
  assert.equal(capturedRequest.headers["x-user-id"], "user-from-env");
  delete process.env[TENSORMESH_USER_ID_ENV_NAME];
});

test("streaming returns text and usage with includeUsage enabled", async () => {
  const provider = createTensormesh({
    apiKey: "tm-stream-key",
    fetch: async () =>
      new Response(
        createEventStream([
          'data: {"id":"chatcmpl-test","choices":[{"delta":{"role":"assistant"},"finish_reason":null}]}\n\n',
          'data: {"id":"chatcmpl-test","choices":[{"delta":{"content":"1, 2, 3, 4, 5"},"finish_reason":null}]}\n\n',
          'data: {"id":"chatcmpl-test","choices":[{"delta":{},"finish_reason":"stop"}],"usage":{"prompt_tokens":6,"completion_tokens":8,"total_tokens":14}}\n\n',
          "data: [DONE]\n\n",
        ]),
        {
          headers: {
            "content-type": "text/event-stream",
          },
        },
      ),
  });

  const result = streamText({
    model: provider("mistralai/Devstral-2-123B-Instruct-2512"),
    prompt: "Count from 1 to 5.",
  });

  let text = "";
  for await (const chunk of result.textStream) {
    text += chunk;
  }

  assert.equal(text, "1, 2, 3, 4, 5");
  const usage = await result.usage;
  assert.equal(usage.inputTokens, 6);
  assert.equal(usage.outputTokens, 8);
  assert.equal(usage.totalTokens, 14);
  assert.equal(usage.reasoningTokens, 0);
  assert.equal(usage.cachedInputTokens, 0);
  assert.deepEqual(usage.raw, {
    prompt_tokens: 6,
    completion_tokens: 8,
    total_tokens: 14,
  });
});

test("chat models enable structured outputs", () => {
  const provider = createTensormesh({
    apiKey: "tm-test-key",
  });

  assert.equal(
    provider("mistralai/Devstral-2-123B-Instruct-2512").supportsStructuredOutputs,
    true,
  );
});

function createEventStream(chunks) {
  const encoder = new TextEncoder();

  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
}
