"use client";

import { useChat } from "@ai-sdk/react";
import { ChatInput } from "./chat-input";

export function ChatPageClient() {
  const { error, status, sendMessage, messages, regenerate, stop } = useChat();

  return (
    <section className="panel messages">
      <div className="panel-toolbar">
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
          <button className="button button-secondary" onClick={() => regenerate()}>
            Retry
          </button>
        </div>
      ) : null}

      <ChatInput status={status} onSubmit={(text) => sendMessage({ text })} stop={stop} />
    </section>
  );
}
