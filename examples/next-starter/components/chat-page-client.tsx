"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import { ChatInput } from "./chat-input";
import { ModelSelect } from "./model-select";

type ChatPageClientProps = {
  defaultModelId: string;
};

export function ChatPageClient({ defaultModelId }: ChatPageClientProps) {
  const [modelId, setModelId] = useState(defaultModelId);
  const { error, status, sendMessage, messages, regenerate, stop } = useChat();

  return (
    <section className="panel messages">
      <div className="panel-toolbar">
        <ModelSelect
          value={modelId}
          fallbackModelId={defaultModelId}
          disabled={status !== "ready"}
          onChange={setModelId}
        />
        <span className="status-badge">{status}</span>
      </div>

      {messages.length === 0 ? (
        <div className="empty-state">
          Ask something simple to confirm streaming works end to end.
        </div>
      ) : null}

      {messages.map((message) => (
        <article key={message.id} className="message">
          <div className="message-role">{message.role}</div>
          {message.parts.map((part, index) => {
            if (part.type === "text") {
              return (
                <div key={index} className="message-body">
                  {part.text}
                </div>
              );
            }

            return null;
          })}
        </article>
      ))}

      {error ? (
        <div className="alert">
          <div className="message-role">error</div>
          <div className="message-body">{error.message}</div>
          <button
            className="button button-secondary"
            onClick={() => regenerate({ body: { modelId } })}
          >
            Retry
          </button>
        </div>
      ) : null}

      <ChatInput
        status={status}
        disabled={!modelId}
        onSubmit={(text) => sendMessage({ text }, { body: { modelId } })}
        stop={stop}
      />
    </section>
  );
}
