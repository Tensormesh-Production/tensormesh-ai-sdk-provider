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

test("completionModel uses the completions endpoint", async () => {
  let capturedRequest;
  const provider = createTensormesh({
    apiKey: "tm-completion-key",
    fetch: async (input, init) => {
      capturedRequest = {
        url: String(input),
        method: init?.method,
        headers: Object.fromEntries(new Headers(init?.headers).entries()),
        body: JSON.parse(String(init?.body)),
      };

      return Response.json({
        id: "cmpl-test",
        object: "text_completion",
        created: 1,
        model: "openai/gpt-oss-20b",
        choices: [
          {
            text: "Hello from a Tensormesh completion.",
            index: 0,
            finish_reason: "stop",
          },
        ],
        usage: {
          prompt_tokens: 6,
          completion_tokens: 5,
          total_tokens: 11,
        },
      });
    },
  });

  const result = await generateText({
    model: provider.completionModel("openai/gpt-oss-20b"),
    prompt: "Say hello.",
  });

  assert.equal(result.text, "Hello from a Tensormesh completion.");
  assert.equal(
    provider.completionModel("openai/gpt-oss-20b").provider,
    "tensormesh.completion",
  );
  assert.equal(
    capturedRequest.url,
    `${DEFAULT_TENSORMESH_SERVERLESS_BASE_URL}/completions`,
  );
  assert.equal(capturedRequest.method, "POST");
  assert.equal(
    capturedRequest.headers.authorization,
    "Bearer tm-completion-key",
  );
  assert.equal(capturedRequest.body.model, "openai/gpt-oss-20b");
});

test("responses.create supports GPT OSS tool-calling payloads", async () => {
  let capturedRequest;
  const provider = createTensormesh({
    apiKey: "tm-gpt-oss-key",
    fetch: async (input, init) => {
      capturedRequest = {
        url: String(input),
        method: init?.method,
        headers: Object.fromEntries(new Headers(init?.headers).entries()),
        body: JSON.parse(String(init?.body)),
      };

      return Response.json({
        id: "resp-gpt-oss-tool",
        object: "response",
        model: "openai/gpt-oss-20b",
        output: [
          {
            type: "function_call",
            id: "fc_weather",
            call_id: "call_weather",
            name: "weather",
            arguments: "{\"city\":\"Bangkok\"}",
          },
        ],
      });
    },
  });

  const weatherTool = {
    type: "function",
    name: "weather",
    description: "Return the weather for a city.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        city: {
          type: "string",
          description: "City name to look up",
        },
      },
      required: ["city"],
      additionalProperties: false,
    },
  };

  const response = await provider.responses.create({
    model: "openai/gpt-oss-20b",
    input:
      "What is the weather in Bangkok? Use the weather tool, then answer in one sentence.",
    tools: [weatherTool],
    tool_choice: "auto",
  });

  assert.equal(
    capturedRequest.url,
    `${DEFAULT_TENSORMESH_SERVERLESS_BASE_URL}/responses`,
  );
  assert.equal(capturedRequest.method, "POST");
  assert.equal(
    capturedRequest.headers.authorization,
    "Bearer tm-gpt-oss-key",
  );
  assert.equal(capturedRequest.body.model, "openai/gpt-oss-20b");
  assert.deepEqual(capturedRequest.body.tools, [weatherTool]);
  assert.equal(capturedRequest.body.tool_choice, "auto");
  assert.equal(response.output[0].type, "function_call");
  assert.equal(response.output[0].name, "weather");
  assert.equal(response.output[0].arguments, "{\"city\":\"Bangkok\"}");
});

test("raw inference helpers call the documented endpoint paths", async () => {
  const requests = [];
  const provider = createTensormesh({
    baseURL: "https://example.tensormesh.ai/v1/",
    apiKey: "tm-raw-key",
    userId: "user-raw",
    fetch: async (input, init) => {
      const body = init?.body ? JSON.parse(String(init.body)) : undefined;
      const request = {
        url: String(input),
        path: new URL(String(input)).pathname,
        method: init?.method,
        headers: Object.fromEntries(new Headers(init?.headers).entries()),
        body,
      };
      requests.push(request);

      switch (request.path) {
        case "/v1/models":
          return Response.json({
            object: "list",
            data: [{ id: "openai/gpt-oss-20b", object: "model" }],
          });
        case "/v1/responses":
          if (request.body?.stream) {
            return new Response("data: [DONE]\n\n", {
              headers: { "content-type": "text/event-stream" },
            });
          }
          return Response.json({
            id: "resp-test",
            output: [{ type: "message", content: [{ type: "output_text", text: "ok" }] }],
          });
        case "/tokenize":
          return Response.json({ tokens: [1, 2, 3] });
        case "/detokenize":
          return Response.json({ prompt: "hello" });
        case "/health":
          return Response.json({ status: "ok" });
        case "/version":
          return Response.json({ version: "1.2.3" });
        default:
          return Response.json({ error: "unexpected path" }, { status: 404 });
      }
    },
  });

  const models = await provider.models.list();
  const response = await provider.responses.create({
    model: "openai/gpt-oss-20b",
    input: "Say hello.",
  });
  const responseStream = await provider.responses.stream({
    model: "openai/gpt-oss-20b",
    input: "Stream hello.",
  });
  const tokens = await provider.tokenize.create({
    model: "openai/gpt-oss-20b",
    prompt: "Hello!",
  });
  const text = await provider.detokenize.create({
    model: "openai/gpt-oss-20b",
    tokens: [1, 2, 3],
  });
  const health = await provider.health.get();
  const version = await provider.version.get();

  assert.equal(models.data[0].id, "openai/gpt-oss-20b");
  assert.equal(response.id, "resp-test");
  assert.equal(await responseStream.text(), "data: [DONE]\n\n");
  assert.deepEqual(tokens.tokens, [1, 2, 3]);
  assert.equal(text.prompt, "hello");
  assert.equal(health.status, "ok");
  assert.equal(version.version, "1.2.3");

  assert.deepEqual(
    requests.map((request) => [
      requestLabel(request),
      request.method,
      request.url,
    ]),
    [
      ["models.list", "GET", "https://example.tensormesh.ai/v1/models"],
      [
        "responses.create",
        "POST",
        "https://example.tensormesh.ai/v1/responses",
      ],
      [
        "responses.stream",
        "POST",
        "https://example.tensormesh.ai/v1/responses",
      ],
      ["tokenize.create", "POST", "https://example.tensormesh.ai/tokenize"],
      [
        "detokenize.create",
        "POST",
        "https://example.tensormesh.ai/detokenize",
      ],
      ["health.get", "GET", "https://example.tensormesh.ai/health"],
      ["version.get", "GET", "https://example.tensormesh.ai/version"],
    ],
  );
  assert.equal(requests[0].headers.authorization, "Bearer tm-raw-key");
  assert.equal(requests[0].headers["x-user-id"], "user-raw");
  assert.equal(requests[1].body.stream, undefined);
  assert.equal(requests[2].body.stream, true);
});

test("models.list returns models from /v1/models", async () => {
  const { provider, getRequest } = createRawEndpointTestProvider(() =>
    Response.json({
      object: "list",
      data: [
        {
          id: "mistralai/Devstral-2-123B-Instruct-2512",
          object: "model",
        },
      ],
    }),
  );

  const models = await provider.models.list({
    headers: {
      "X-Test-Case": "models",
    },
  });
  const request = getRequest();

  assert.equal(request.url, "https://raw.tensormesh.ai/v1/models");
  assert.equal(request.method, "GET");
  assert.equal(request.body, undefined);
  assert.equal(request.headers.authorization, "Bearer tm-endpoint-key");
  assert.equal(request.headers["x-test-case"], "models");
  assert.equal(
    models.data[0].id,
    "mistralai/Devstral-2-123B-Instruct-2512",
  );
});

test("responses.stream sends a streaming request to /v1/responses", async () => {
  const { provider, getRequest } = createRawEndpointTestProvider(
    () =>
      new Response("data: [DONE]\n\n", {
        headers: { "content-type": "text/event-stream" },
      }),
  );

  const response = await provider.responses.stream({
    model: "openai/gpt-oss-20b",
    input: "Stream this.",
  });
  const request = getRequest();

  assert.equal(request.url, "https://raw.tensormesh.ai/v1/responses");
  assert.equal(request.method, "POST");
  assert.equal(request.headers.accept, "text/event-stream");
  assert.equal(request.headers["content-type"], "application/json");
  assert.deepEqual(request.body, {
    model: "openai/gpt-oss-20b",
    input: "Stream this.",
    stream: true,
  });
  assert.equal(await response.text(), "data: [DONE]\n\n");
});

test("tokenize.create calls /tokenize at the root API URL", async () => {
  const { provider, getRequest } = createRawEndpointTestProvider(() =>
    Response.json({ tokens: [101, 102, 103] }),
  );

  const result = await provider.tokenize.create({
    model: "openai/gpt-oss-20b",
    prompt: "Hello!",
  });
  const request = getRequest();

  assert.equal(request.url, "https://raw.tensormesh.ai/tokenize");
  assert.equal(request.method, "POST");
  assert.deepEqual(request.body, {
    model: "openai/gpt-oss-20b",
    prompt: "Hello!",
  });
  assert.deepEqual(result.tokens, [101, 102, 103]);
});

test("detokenize.create calls /detokenize at the root API URL", async () => {
  const { provider, getRequest } = createRawEndpointTestProvider(() =>
    Response.json({ prompt: "Hello!" }),
  );

  const result = await provider.detokenize.create({
    model: "openai/gpt-oss-20b",
    tokens: [101, 102, 103],
  });
  const request = getRequest();

  assert.equal(request.url, "https://raw.tensormesh.ai/detokenize");
  assert.equal(request.method, "POST");
  assert.deepEqual(request.body, {
    model: "openai/gpt-oss-20b",
    tokens: [101, 102, 103],
  });
  assert.equal(result.prompt, "Hello!");
});

test("health.get calls /health at the root API URL", async () => {
  const { provider, getRequest } = createRawEndpointTestProvider(() =>
    Response.json({ status: "ok" }),
  );

  const result = await provider.health.get();
  const request = getRequest();

  assert.equal(request.url, "https://raw.tensormesh.ai/health");
  assert.equal(request.method, "GET");
  assert.equal(request.body, undefined);
  assert.equal(result.status, "ok");
});

test("version.get calls /version at the root API URL", async () => {
  const { provider, getRequest } = createRawEndpointTestProvider(() =>
    Response.json({ version: "1.2.3" }),
  );

  const result = await provider.version.get();
  const request = getRequest();

  assert.equal(request.url, "https://raw.tensormesh.ai/version");
  assert.equal(request.method, "GET");
  assert.equal(request.body, undefined);
  assert.equal(result.version, "1.2.3");
});

test("public raw GET helpers do not require an API key", async () => {
  const previousApiKey = process.env[TENSORMESH_INFERENCE_API_KEY_ENV_NAME];
  delete process.env[TENSORMESH_INFERENCE_API_KEY_ENV_NAME];

  try {
    const requests = [];
    const provider = createTensormesh({
      fetch: async (input, init) => {
        requests.push({
          url: String(input),
          headers: Object.fromEntries(new Headers(init?.headers).entries()),
        });

        return Response.json(
          String(input).endsWith("/models")
            ? { object: "list", data: [] }
            : String(input).endsWith("/health")
              ? { status: "ok" }
              : { version: "1.2.3" },
        );
      },
    });

    await provider.models.list();
    await provider.health.get();
    await provider.version.get();

    assert.equal(
      requests[0].url,
      `${DEFAULT_TENSORMESH_SERVERLESS_BASE_URL}/models`,
    );
    assert.equal(requests[1].url, "https://serverless.tensormesh.ai/health");
    assert.equal(requests[2].url, "https://serverless.tensormesh.ai/version");
    assert.equal(requests[0].headers.authorization, undefined);
    assert.equal(requests[1].headers.authorization, undefined);
    assert.equal(requests[2].headers.authorization, undefined);
  } finally {
    if (previousApiKey === undefined) {
      delete process.env[TENSORMESH_INFERENCE_API_KEY_ENV_NAME];
    } else {
      process.env[TENSORMESH_INFERENCE_API_KEY_ENV_NAME] = previousApiKey;
    }
  }
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

function createRawEndpointTestProvider(createResponse) {
  let capturedRequest;
  const provider = createTensormesh({
    baseURL: "https://raw.tensormesh.ai/v1",
    apiKey: "tm-endpoint-key",
    fetch: async (input, init) => {
      capturedRequest = {
        url: String(input),
        method: init?.method,
        headers: Object.fromEntries(new Headers(init?.headers).entries()),
        body: init?.body ? JSON.parse(String(init.body)) : undefined,
      };

      return createResponse(capturedRequest);
    },
  });

  return {
    provider,
    getRequest() {
      return capturedRequest;
    },
  };
}

function requestLabel(request) {
  switch (request.path) {
    case "/v1/models":
      return "models.list";
    case "/v1/responses":
      return request.body?.stream ? "responses.stream" : "responses.create";
    case "/tokenize":
      return "tokenize.create";
    case "/detokenize":
      return "detokenize.create";
    case "/health":
      return "health.get";
    case "/version":
      return "version.get";
    default:
      return request.path;
  }
}
