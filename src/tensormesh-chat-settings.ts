// Small curated chat model subset for editor autocomplete.
// These ids come from the validated Tensormesh `chat/completions` path used by
// this package across serverless and on-demand. Keep the list intentionally
// short and still allow free-form model ids from live deployment discovery.
export type TensormeshChatModelId =
  | "mistralai/Devstral-2-123B-Instruct-2512"
  | "Qwen/Qwen3-Coder-30B-A3B-Instruct"
  | "Qwen/Qwen3-235B-A22B"
  | "Qwen/Qwen3-30B-A3B"
  | "Qwen/Qwen3-Coder-480B-A35B-Instruct-FP8"
  | "MiniMaxAI/MiniMax-M2.5"
  | "openai/gpt-oss-120b"
  | "openai/gpt-oss-20b"
  | (string & {});
