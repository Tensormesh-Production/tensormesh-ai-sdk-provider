"use client";

import { useEffect, useState } from "react";

type ModelSelectProps = {
  value: string;
  fallbackModelId: string;
  disabled?: boolean;
  onChange: (modelId: string) => void;
};

type ModelsResponse = {
  models?: string[];
};

export function ModelSelect({
  value,
  fallbackModelId,
  disabled,
  onChange,
}: ModelSelectProps) {
  const [models, setModels] = useState<string[]>(
    fallbackModelId ? [fallbackModelId] : [],
  );
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  useEffect(() => {
    let ignore = false;

    async function loadModels() {
      try {
        const response = await fetch("/api/models");

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const data = (await response.json()) as ModelsResponse;
        const modelIds = Array.isArray(data.models) ? data.models : [];

        if (ignore) {
          return;
        }

        setModels(
          modelIds.length > 0
            ? modelIds
            : fallbackModelId
              ? [fallbackModelId]
              : [],
        );
        setStatus("ready");

        if (modelIds.length > 0 && (!value || !modelIds.includes(value))) {
          const nextModelId =
            fallbackModelId && modelIds.includes(fallbackModelId)
              ? fallbackModelId
              : modelIds[0];

          onChange(nextModelId);
        }
      } catch {
        if (ignore) {
          return;
        }

        setStatus("error");

        if (!value && fallbackModelId) {
          onChange(fallbackModelId);
        }
      }
    }

    loadModels();

    return () => {
      ignore = true;
    };
  }, []);

  const options = models.length > 0 ? models : value ? [value] : [];

  return (
    <label className="model-select">
      <span className="summary-label">Model</span>
      <select
        value={value}
        title={value || fallbackModelId}
        disabled={disabled || options.length === 0}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.length === 0 ? (
          <option value="">No models loaded</option>
        ) : null}
        {options.map((modelId) => (
          <option key={modelId} value={modelId}>
            {modelId}
          </option>
        ))}
      </select>
      <span className="model-select-status">
        {status === "loading"
          ? "Loading models..."
          : status === "error"
            ? "Using configured fallback"
            : `${options.length} model${options.length === 1 ? "" : "s"}`}
      </span>
    </label>
  );
}
