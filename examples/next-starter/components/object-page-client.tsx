"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { useState } from "react";
import { ideaSchema } from "../app/api/object/schema";
import { ModelSelect } from "./model-select";

type ObjectPageClientProps = {
  defaultModelId: string;
};

export function ObjectPageClient({ defaultModelId }: ObjectPageClientProps) {
  const [modelId, setModelId] = useState(defaultModelId);
  const { submit, isLoading, object, stop, error, clear } = useObject({
    api: "/api/object",
    schema: ideaSchema,
  });

  return (
    <>
      <section className="panel">
        <div className="panel-toolbar">
          <ModelSelect
            value={modelId}
            fallbackModelId={defaultModelId}
            disabled={isLoading}
            onChange={setModelId}
          />
          <span className="status-badge">{isLoading ? "streaming" : "ready"}</span>
        </div>
        <div className="chat-input-row">
          <button
            className="button"
            onClick={() =>
              submit({
                context: "Create a launch idea for a GPU inference startup.",
                modelId,
              })
            }
            disabled={isLoading || !modelId}
          >
            Generate object
          </button>
          <button className="button button-secondary" onClick={() => clear()}>
            Clear
          </button>
          {isLoading ? (
            <button className="button button-secondary" onClick={() => stop()}>
              Stop
            </button>
          ) : null}
        </div>
        {error ? <div className="alert">{error.message}</div> : null}
      </section>

      <section className="panel">
        <pre className="mono-block">
          {JSON.stringify(object ?? { product: null }, null, 2)}
        </pre>
      </section>
    </>
  );
}
